import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { IRetailer } from './retailer.interface';
import config from '../../config';
import generateUserId from '../../utils/generateUserId';
import passwordHash from '../../utils/passwordHash';
import mongoose, { PipelineStage, Types } from 'mongoose';
import { Retailer } from './retailer.model';
import QueryBuilder from '../../builder/QueryBuilder';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { JwtPayload } from 'jsonwebtoken';
import { Order } from '../order/order.model';
import { CustomerCareData } from '../customerCare/customerCare.model';
import { IOrder } from '../order/order.interface';
import generatePhone from '../../utils/generatePhone';
import findNearDistanceRetailer from '../../utils/findNearDistanceRetailer';
import { Union } from '../union/union.model';

// create retailer
const createRetailerIntoDB = async (
    payload: IUser & IRetailer,
    createdBy: JwtPayload
) => {
    const userData: Partial<IUser> = {
        name: payload.shopName,
        role: payload.role,
        password: config.defaultPassword,
        profileImg: config.profileImg,
    };

    let uniquePhone = false;
    let phone = '';

    while (!uniquePhone) {
        phone = await generatePhone();
        const user = await User.isUserExistByPhone(payload.phone);
        if (!user?.phone) {
            uniquePhone = true;
        }
    }

    userData.phone = phone;

    userData.id = await generateUserId(payload.shopName, phone);
    userData.password = await passwordHash(userData.password as string);

    const retailerData: Partial<IRetailer> = {
        shopName: payload.shopName,
        union: payload.union,
        area: payload.area,
        location: {
            latitude: payload.location.latitude,
            longitude: payload.location.longitude,
        },
        createdBy: createdBy.userID,
    };

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const createdUser = await User.create([userData], { session });
        retailerData.retailer = createdUser[0]?._id;

        await Retailer.findOneAndUpdate(
            { retailer: retailerData.retailer },
            retailerData,
            { session, upsert: true, new: true }
        );

        await session.commitTransaction();
        await session.endSession();

        const result = Retailer.findOne({
            retailer: retailerData.retailer,
        }).populate('retailer');

        return result;
    } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Mongoose transaction failed',
            err as string
        );
    }
};

// get all retailer
const getAllRetailerFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        User.find({ role: 'retailer', isDeleted: false }),
        query
    )
        .search(['name', 'phone'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const users = await fetchQuery.modelQuery;
    const userIDs = users?.map(user => user._id);
    const result = await Retailer.find({ retailer: { $in: userIDs } })
        .populate('retailer')
        .populate('retailer.retailer')
        .populate('union')
        .populate('area')
        .populate('createdBy');
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get retailers near me
const getRetailersNearMeFromDB = async (query: Record<string, unknown>) => {
    const retailers = await Retailer.find({ union: { $in: query.union } })
        .populate('retailer', '_id id name')
        .populate('union', '_id id name bnName')
        .select('shopName location');
    if (retailers.length === 0) {
        return [];
    }
    const result = await findNearDistanceRetailer(
        retailers,
        Number(query.latitude),
        Number(query.longitude)
    );
    return result;
};

// get all retailer by area
const getAllRetailerByAreaFromDB = async (
    query: Record<string, unknown>,
    userPayload: JwtPayload
) => {
    let areas = query?.area;

    if (areas === undefined) {
        throw new AppError(httpStatus.NOT_FOUND, 'Missing area id');
    }

    if (typeof areas === 'string') {
        areas = [areas];
    }

    const areaIds = (areas as string[]).map(id => new Types.ObjectId(id));

    const startOfDay = moment().tz(TIMEZONE).startOf('day').format();
    const endOfDay = moment().tz(TIMEZONE).endOf('day').format();

    const sr = await User.findOne({ id: userPayload.userId }).select('_id');
    if (!sr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No sr found');
    }

    const result = await Retailer.aggregate([
        { $match: { union: { $in: areaIds } } },
        {
            $group: {
                _id: '$union',
                retailerCount: { $sum: 1 },
                retailers: { $push: '$_id' },
            },
        },
        {
            $lookup: {
                from: 'retailers',
                localField: 'retailers',
                foreignField: '_id',
                as: 'retailerDetails',
            },
        },
        { $unwind: '$retailerDetails' },
        {
            $lookup: {
                from: 'users',
                let: { retailerId: '$retailerDetails.retailer' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$retailerId'] },
                            isDeleted: false,
                        },
                    },
                ],
                as: 'retailerDetails.retailerData',
            },
        },
        {
            $lookup: {
                from: 'areas',
                let: { areaID: '$retailerDetails.area' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$_id', '$$areaID'] },
                        },
                    },
                ],
                as: 'retailerDetails.areaData',
            },
        },
        {
            $match: {
                'retailerDetails.retailerData': { $ne: [] },
            },
        },
        {
            $lookup: {
                from: 'orders',
                let: {
                    retailerId: '$retailerDetails.retailer',
                    areaId: '$retailerDetails.union',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$retailer', '$$retailerId'] },
                                    { $eq: ['$area', '$$areaId'] },
                                    { $eq: ['$sr', sr._id] },
                                    { $gte: ['$createdAt', startOfDay] },
                                    { $lte: ['$createdAt', endOfDay] },
                                ],
                            },
                        },
                    },
                    { $limit: 1 },
                ],
                as: 'retailerDetails.isOrdered',
            },
        },
        {
            $addFields: {
                'retailerDetails.isOrdered': {
                    $gt: [{ $size: '$retailerDetails.isOrdered' }, 0],
                },
            },
        },
        {
            $addFields: {
                'retailerDetails.retailerData': {
                    $arrayElemAt: ['$retailerDetails.retailerData', 0],
                },
            },
        },
        {
            $project: {
                'retailerDetails.retailerData.password': 0,
                'retailerDetails.retailerData.nid': 0,
                'retailerDetails.retailerData.needPasswordChange': 0,
                'retailerDetails.retailerData.createdAt': 0,
                'retailerDetails.retailerData.updatedAt': 0,
            },
        },
        {
            $lookup: {
                from: 'unions',
                localField: '_id',
                foreignField: '_id',
                as: 'areaDetails',
            },
        },
        {
            $group: {
                _id: '$_id',
                retailerCount: { $first: '$retailerCount' },
                retailers: { $push: '$retailerDetails' },
                areaDetails: { $first: '$areaDetails' },
            },
        },
        { $sort: { 'areaDetails.name': 1 } },
    ]);

    return result;
};

const getAllRetailerByAreaOptimizeFromDB = async (
    query: Record<string, unknown>,
    userPayload: JwtPayload
) => {
    const fetchQuery = new QueryBuilder(
        Union.find().select('id name').sort('name'),
        query
    )
        .filter()
        .sort()
        .paginate();

    const unions = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    if (unions.length === 0) {
        return { result: [], meta };
    }

    const startOfDay = moment().tz(TIMEZONE).startOf('day').format();
    const endOfDay = moment().tz(TIMEZONE).endOf('day').format();

    const sr = await User.findOne({ id: userPayload.userId }).select('_id');
    if (!sr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No sr found');
    }

    const result = await Promise.all(
        unions.map(async union => {
            const retailers = await Retailer.find({
                union: union._id,
            })
                .select('retailer shopName location')
                .populate('area');

            const retailersData = await Promise.all(
                retailers.map(async retailer => {
                    const user = await User.findById(retailer.retailer).select(
                        'id name profileImg'
                    );

                    const isOrdered = await Order.find({
                        area: union._id,
                        retailer: retailer.retailer,
                        status: 'Processing',
                        createdAt: {
                            $gte: startOfDay,
                            $lte: endOfDay,
                        },
                    }).select('id');

                    return {
                        ...retailer.toObject(),
                        retailerDetails: user,
                        isOrdered: isOrdered ? true : false,
                    };
                })
            );

            return {
                ...union.toObject(),
                retailerCount: retailers.length,
                retailers: retailersData,
            };
        })
    );

    return result;
};

// get all retailer for deliveryman
const getAllRetailerForDeliverymanFromDB = async (
    query: Record<string, unknown>
) => {
    const { dsr, search } = query;

    const pipeline: PipelineStage[] = [
        {
            $match: {
                status: { $in: ['Dispatched', 'Baki'] },
                dsr: new Types.ObjectId(dsr as string),
            },
        },
        {
            $lookup: {
                from: 'retailers',
                localField: 'retailer',
                foreignField: 'retailer',
                as: 'retailer',
            },
        },
        { $unwind: '$retailer' },
        {
            $lookup: {
                from: 'users',
                localField: 'retailer.retailer',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        {
            $lookup: {
                from: 'unions',
                localField: 'retailer.union',
                foreignField: '_id',
                as: 'union',
            },
        },
        { $unwind: '$union' },
        {
            $project: {
                _id: '$user._id',
                id: '$user.id',
                name: '$user.name',
                profileImg: '$user.profileImg',
                shopName: '$retailer.shopName',
                location: '$retailer.location',
                area: '$union.bnName',
                status: 1,
            },
        },
        { $group: { _id: '$_id', data: { $first: '$$ROOT' } } },
        { $replaceRoot: { newRoot: '$data' } },
        { $sort: { shopName: 1 } },
    ];

    if (search && typeof search === 'string') {
        pipeline.push({
            $match: { name: { $regex: search, $options: 'i' } },
        });
    }

    const retailers = await Order.aggregate(pipeline);

    return retailers;
};

// get single retailer for deliveryman
const getSingleRetailerForDeliverymanFromDB = async (
    id: string,
    query: Record<string, unknown>
) => {
    const { dsr } = query;

    const pipeline = [
        { $match: { id } },
        {
            $project: {
                _id: 1,
                id: 1,
                name: 1,
                profileImg: 1,
            },
        },
        {
            $lookup: {
                from: 'retailers',
                localField: '_id',
                foreignField: 'retailer',
                as: 'retailerData',
            },
        },
        {
            $unwind: {
                path: '$retailerData',
                preserveNullAndEmptyArrays: false,
            },
        },
        {
            $lookup: {
                from: 'unions',
                localField: 'retailerData.union',
                foreignField: '_id',
                as: 'unionData',
            },
        },
        { $unwind: '$unionData' },
        {
            $lookup: {
                from: 'orders',
                let: { retailerId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$retailer', '$$retailerId'] },
                                    {
                                        $in: [
                                            '$status',
                                            ['Dispatched', 'Baki'],
                                        ],
                                    },
                                    {
                                        $eq: [
                                            '$dsr',
                                            new Types.ObjectId(dsr as string),
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'sr',
                            foreignField: '_id',
                            as: 'sr',
                        },
                    },
                    {
                        $unwind: {
                            path: '$sr',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'products.product',
                            foreignField: '_id',
                            as: 'productDetails',
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        id: 1,
                                        name: 1,
                                        bnName: 1,
                                        packageType: 1,
                                        quantityPerPackage: 1,
                                        price: 1,
                                        image: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            products: {
                                $map: {
                                    input: '$products',
                                    as: 'p',
                                    in: {
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$productDetails',
                                                        cond: {
                                                            $eq: [
                                                                '$$this._id',
                                                                '$$p.product',
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                        quantity: '$$p.quantity',
                                        price: '$$p.price',
                                        totalAmount: '$$p.totalAmount',
                                        dealerPrice: '$$p.dealerPrice',
                                        dealerTotalAmount:
                                            '$$p.dealerTotalAmount',
                                        srPrice: '$$p.srPrice',
                                        srTotalAmount: '$$p.srTotalAmount',
                                        summary: '$$p.summary',
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            status: 1,
                            paymentStatus: 1,
                            collectionAmount: 1,
                            collectedAmount: 1,
                            sr: {
                                _id: '$sr._id',
                                id: '$sr.id',
                                name: '$sr.name',
                                profileImg: '$sr.profileImg',
                            },
                            products: 1,
                        },
                    },
                ],
                as: 'orders',
            },
        },
        {
            $project: {
                _id: 1,
                id: 1,
                name: 1,
                profileImg: 1,
                union: {
                    _id: '$unionData._id',
                    id: '$unionData.id',
                    name: '$unionData.name',
                    bnName: '$unionData.bnName',
                },
                shopName: '$retailerData.shopName',
                orders: 1,
            },
        },
    ];

    const result = await User.aggregate(pipeline);

    if (!result.length) {
        throw new AppError(httpStatus.NOT_FOUND, 'No retailer found');
    }

    return result[0];
};

// get invoices retailer for deliveryman
const getInvoicesRetailerForDeliverymanFromDB = async (
    query: Record<string, unknown>
) => {
    const { dsr, dealer, sr, updatedAt } = query;

    const matchStages: Record<string, unknown> = {
        status: { $nin: ['Dispatched', 'Processing'] },
    };

    if (sr) {
        matchStages.sr = new Types.ObjectId(sr as string);
    }
    if (dsr) {
        matchStages.dsr = new Types.ObjectId(dsr as string);
    }
    if (dealer) {
        matchStages.dealer = new Types.ObjectId(dealer as string);
    }
    if (updatedAt) {
        matchStages.updatedAt = {
            $gte: moment
                .tz((updatedAt as { gte: string; lte: string }).gte, TIMEZONE)
                .startOf('day')
                .format(),
            $lte: moment
                .tz((updatedAt as { gte: string; lte: string }).lte, TIMEZONE)
                .endOf('day')
                .format(),
        };
    }

    const pipeline: PipelineStage[] = [
        { $match: matchStages },
        {
            $group: {
                _id: '$retailer',
                orders: { $push: '$$ROOT' },
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: false } },
        {
            $lookup: {
                from: 'retailers',
                localField: '_id',
                foreignField: 'retailer',
                as: 'retailerData',
            },
        },
        {
            $unwind: {
                path: '$retailerData',
                preserveNullAndEmptyArrays: false,
            },
        },
        { $sort: { 'retailerData.shopName': 1 } },
        {
            $lookup: {
                from: 'users',
                localField: 'orders.sr',
                foreignField: '_id',
                as: 'srUsers',
            },
        },
        {
            $lookup: {
                from: 'products',
                localField: 'orders.products.product',
                foreignField: '_id',
                as: 'productDetails',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            id: 1,
                            name: 1,
                            bnName: 1,
                            packageType: 1,
                            quantityPerPackage: 1,
                            price: 1,
                            image: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                orders: {
                    $map: {
                        input: '$orders',
                        as: 'order',
                        in: {
                            _id: '$$order._id',
                            id: '$$order.id',
                            status: '$$order.status',
                            paymentStatus: '$$order.paymentStatus',
                            collectionAmount: '$$order.collectionAmount',
                            collectedAmount: '$$order.collectedAmount',
                            sr: {
                                $let: {
                                    vars: {
                                        matchedSr: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$srUsers',
                                                        cond: {
                                                            $eq: [
                                                                '$$this._id',
                                                                '$$order.sr',
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        _id: '$$matchedSr._id',
                                        id: '$$matchedSr.id',
                                        name: '$$matchedSr.name',
                                        profileImg: '$$matchedSr.profileImg',
                                    },
                                },
                            },
                            products: {
                                $map: {
                                    input: '$$order.products',
                                    as: 'p',
                                    in: {
                                        quantity: '$$p.quantity',
                                        price: '$$p.price',
                                        totalAmount: '$$p.totalAmount',
                                        dealerPrice: '$$p.dealerPrice',
                                        dealerTotalAmount:
                                            '$$p.dealerTotalAmount',
                                        srPrice: '$$p.srPrice',
                                        srTotalAmount: '$$p.srTotalAmount',
                                        summary: '$$p.summary',
                                        product: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: '$productDetails',
                                                        cond: {
                                                            $eq: [
                                                                '$$this._id',
                                                                '$$p.product',
                                                            ],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                _id: '$user._id',
                id: '$user.id',
                name: '$user.name',
                profileImg: '$user.profileImg',
                shopName: '$retailerData.shopName',
                orders: 1,
            },
        },
    ];

    const result = await Order.aggregate(pipeline);

    return result;
};

// get pending retailer for deliveryman
const getPendingRetailerForDeliverymanFromDB = async (
    date: string,
    query: Record<string, unknown>
) => {
    const fetchQuery = new QueryBuilder(
        Union.find().select('id name').sort('name'),
        query
    )
        .filter()
        .sort()
        .paginate();

    const unions = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    if (unions.length === 0) {
        return { result: [], meta };
    }

    const result = await Promise.all(
        unions.map(async union => {
            const retailers = await Retailer.find({
                union: union._id,
            }).populate('retailer');

            const orders = await Promise.all(
                retailers.map(async retailer => {
                    const startDay = moment
                        .tz(date, TIMEZONE)
                        .startOf('day')
                        .format();
                    const endDay = moment
                        .tz(date, TIMEZONE)
                        .endOf('day')
                        .format();

                    const ordersData = await Order.find({
                        area: union._id,
                        retailer: retailer.retailer._id,
                        status: 'Pending',
                    })
                        .select('id retailer sr dealer collectionAmount')
                        .populate('sr');

                    const orderIds = ordersData.map(order => order._id);

                    const pendingOrders = await CustomerCareData.find({
                        order: { $in: orderIds },
                        requestType: 'Pending',
                        status: 'Interest',
                        requestDate: {
                            $gte: startDay,
                            $lte: endDay,
                        },
                    })
                        .select('order')
                        .populate<{ order: IOrder & { _id: Types.ObjectId } }>(
                            'order'
                        );

                    const moderatePendingOrders = await Promise.all(
                        pendingOrders.map(async order => {
                            const sr = await User.findById(
                                order.toObject().order.sr
                            );
                            return {
                                _id: order.toObject().order._id,
                                id: order.toObject().order.id,
                                retailer: order.toObject().order.retailer,
                                dealer: order.toObject().order.dealer,
                                sr,
                                collectionAmount:
                                    order.toObject().order.collectionAmount,
                                collectedAmount:
                                    order.toObject().order.collectedAmount,
                            };
                        })
                    );

                    return {
                        ...retailer.toObject(),
                        orders: moderatePendingOrders,
                    };
                })
            );

            const filteredRetailers = orders.filter(
                order => order.orders.length > 0
            );

            return {
                ...union.toObject(),
                retailerCount: filteredRetailers.length,
                retailers: filteredRetailers,
            };
        })
    );

    return { result, meta };
};

// get baki retailer for deliveryman
const getBakiRetailerForDeliverymanFromDB = async (
    date: string,
    query: Record<string, unknown>
) => {
    const fetchQuery = new QueryBuilder(
        Union.find().select('id name').sort('name'),
        query
    )
        .filter()
        .sort()
        .paginate();

    const unions = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    if (unions.length === 0) {
        return { result: [], meta };
    }

    const result = await Promise.all(
        unions.map(async union => {
            const retailers = await Retailer.find({
                union: union._id,
            }).populate('retailer');

            const orders = await Promise.all(
                retailers.map(async retailer => {
                    const startDay = moment
                        .tz(date, TIMEZONE)
                        .startOf('day')
                        .format();
                    const endDay = moment
                        .tz(date, TIMEZONE)
                        .endOf('day')
                        .format();

                    const ordersData = await Order.find({
                        area: union._id,
                        retailer: retailer.retailer._id,
                        status: 'Baki',
                    }).select('id');

                    const orderIds = ordersData.map(order => order._id);

                    const bakiOrders = await CustomerCareData.find({
                        order: { $in: orderIds },
                        requestType: 'Baki',
                        status: 'Interest',
                        requestDate: {
                            $gte: startDay,
                            $lte: endDay,
                        },
                    })
                        .select('order requestDate')
                        .populate<{ order: IOrder & { _id: Types.ObjectId } }>(
                            'order'
                        );

                    const moderateBakiOrders = await Promise.all(
                        bakiOrders.map(async order => {
                            const sr = await User.findById(
                                order.toObject().order.sr
                            );
                            const dealer = await User.findById(
                                order.toObject().order.dealer
                            );
                            return {
                                _id: order.toObject().order._id,
                                id: order.toObject().order.id,
                                retailer: order.toObject().order.retailer,
                                dealer,
                                sr,
                                collectionAmount:
                                    order.toObject().order.collectionAmount,
                                collectedAmount:
                                    order.toObject().order.collectedAmount,
                                requestDate: order.toObject().requestDate,
                            };
                        })
                    );

                    return {
                        ...retailer.toObject(),
                        orders: moderateBakiOrders,
                    };
                })
            );

            const filteredRetailers = orders.filter(
                order => order.orders.length > 0
            );

            return {
                ...union.toObject(),
                retailerCount: filteredRetailers.length,
                retailers: filteredRetailers,
            };
        })
    );

    return { result, meta };
};

// get all retailer for packingman
// const getAllRetailerForPackingmanFromDB = async (
//     query: Record<string, unknown>
// ) => {
//     const fetchQuery = new QueryBuilder(
//         Union.find().select('id name').sort('name'),
//         query
//     )
//         .filter()
//         .sort()
//         .paginate();

//     const unions = await fetchQuery.modelQuery;
//     const meta = await fetchQuery.countTotal();
//     if (unions.length === 0) {
//         return { result: [], meta };
//     }

//     const result = await Promise.all(
//         unions.map(async union => {
//             const retailers = await Retailer.find({
//                 union: union._id,
//             }).populate('retailer');

//             const orders = await Promise.all(
//                 retailers.map(async retailer => {
//                     const ordersData = await Order.find({
//                         retailer: retailer.retailer._id,
//                         area: union._id,
//                         status: { $in: ['Processing', 'Pending'] },
//                     })
//                         .select(
//                             'id retailer sr dealer collectionAmount collectedAmount createdAt'
//                         )
//                         .populate('sr');

//                     return {
//                         ...retailer.toObject(),
//                         orders: ordersData,
//                     };
//                 })
//             );

//             const filteredRetailers = orders.filter(
//                 order => order.orders.length > 0
//             );

//             return {
//                 ...union.toObject(),
//                 retailerCount: filteredRetailers.length,
//                 retailers: filteredRetailers,
//             };
//         })
//     );

//     return { result, meta };
// };

const getAllRetailerForPackingmanFromDB = async (
    query: Record<string, unknown>
) => {
    const sr = query?.sr;
    const createdAt = query?.createdAt;
    const union = query?.union;

    const matchStage: Record<string, unknown> = {};
    if (sr) {
        matchStage.sr = new Types.ObjectId(sr as string);
    }
    if (union) {
        matchStage.union = new Types.ObjectId(union as string);
    }
    if (createdAt) {
        matchStage.createdAt = {
            $gte: moment.tz(createdAt, TIMEZONE).startOf('day').format(),
            $lte: moment.tz(createdAt, TIMEZONE).endOf('day').format(),
        };
    }

    const result = await Order.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'users',
                localField: 'sr',
                foreignField: '_id',
                as: 'sr',
            },
        },
        { $unwind: '$sr' },
        {
            $lookup: {
                from: 'retailers',
                localField: 'retailer',
                foreignField: '_id',
                as: 'retailer',
            },
        },
        { $unwind: '$retailer' },
        {
            $project: {
                _id: 1,
                id: 1,
                retailer: 1,
                sr: 1,
                dealer: 1,
                collectionAmount: 1,
                collectedAmount: 1,
                createdAt: 1,
            },
        },
    ]);

    return result;
};

// get single retailer
const getSingleRetailerFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    const result = Retailer.findOne({ retailer: user._id })
        .populate('retailer')
        .populate('union')
        .populate('area')
        .populate('createdBy');
    return result;
};

// update retailer
const updateRetailerIntoDB = async (
    id: string,
    payload: IRetailer & { name?: string; phone?: string }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const retailerData = payload;

    if (retailerData?.name && retailerData?.phone) {
        await User.findOneAndUpdate(
            { id },
            { name: retailerData?.name, phone: retailerData?.phone },
            { new: true }
        );

        delete retailerData?.name;
        delete retailerData?.phone;
    }

    const result = await Retailer.findOneAndUpdate(
        { retailer: user._id },
        retailerData,
        { new: true }
    );
    return result;
};

export const RetailerServices = {
    createRetailerIntoDB,
    getAllRetailerFromDB,
    getRetailersNearMeFromDB,
    getAllRetailerByAreaFromDB,
    getAllRetailerByAreaOptimizeFromDB,
    getAllRetailerForDeliverymanFromDB,
    getSingleRetailerForDeliverymanFromDB,
    getInvoicesRetailerForDeliverymanFromDB,
    getPendingRetailerForDeliverymanFromDB,
    getBakiRetailerForDeliverymanFromDB,
    getAllRetailerForPackingmanFromDB,
    getSingleRetailerFromDB,
    updateRetailerIntoDB,
};
