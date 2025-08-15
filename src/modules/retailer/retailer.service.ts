import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import { IRetailer } from './retailer.interface';
import config from '../../config';
import generateUserId from '../../utils/generateUserId';
import passwordHash from '../../utils/passwordHash';
import mongoose, { Types } from 'mongoose';
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
        .populate('retailer')
        .populate('union')
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
                    const ordersData = await Order.find({
                        retailer: retailer.retailer._id,
                        area: union._id,
                        status: 'Dispatched',
                    })
                        .select('id retailer sr dealer collectionAmount')
                        .populate('sr');

                    return {
                        ...retailer.toObject(),
                        orders: ordersData,
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

// get all retailer for deliveryman
const getAllRetailerForDeliverymanOptimizeFromDB = async (
    query: Record<string, unknown>
) => {
    const retailers = await Retailer.find({ union: { $in: query.union } })
        .populate('retailer')
        .select('shopName location');

    const result = await Promise.all(
        retailers.map(async retailer => {
            const ordersData = await Order.find({
                retailer: retailer.retailer._id,
                status: 'Dispatched',
            }).select('id collectionAmount');

            return {
                ...retailer.toObject(),
                orders: ordersData,
            };
        })
    );

    return result;
};

// get invoices retailer for deliveryman
const getInvoicesRetailerForDeliverymanFromDB = async (
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
                        status: { $in: ['Baki', 'Cancelled', 'Delivered'] },
                        updatedAt: {
                            $gte: startDay,
                            $lte: endDay,
                        },
                    })
                        .select(
                            'id retailer sr dealer collectionAmount collectedAmount'
                        )
                        .populate('sr');

                    return {
                        ...retailer.toObject(),
                        orders: ordersData,
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
    getAllRetailerForDeliverymanOptimizeFromDB,
    getInvoicesRetailerForDeliverymanFromDB,
    getPendingRetailerForDeliverymanFromDB,
    getBakiRetailerForDeliverymanFromDB,
    getAllRetailerForPackingmanFromDB,
    getSingleRetailerFromDB,
    updateRetailerIntoDB,
};
