import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { Dealer } from './dealer.model';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { Sr } from '../sr/sr.model';
import { Product } from '../product/product.model';
import { Order } from '../order/order.model';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { Damage } from '../damage/damage.model';

// get all dealer
const getAllDealerFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Dealer.find().populate('dealer').populate('companies'),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get all dealer by user
const getAllDealerByUserFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(User.find({ role: 'dealer' }), query)
        .search(['name', 'phone'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const dealers = await fetchQuery.modelQuery;
    const result = await Promise.all(
        dealers.map(async dealer => {
            const productCount = await Product.countDocuments({
                dealer: dealer._id,
            });

            return {
                ...dealer.toObject(),
                productCount,
            };
        })
    );
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get all dealer with sr and product count
const getAllDealerWithSrAndProductFromDB = async (
    query: Record<string, unknown>
) => {
    const fetchQuery = new QueryBuilder(
        Dealer.find().populate('dealer').populate('companies'),
        query
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();

    if (result?.length > 0) {
        const dealersWithCounts = await Promise.all(
            result.map(async dealer => {
                const srCount = await Sr.countDocuments({
                    dealers: { $in: [dealer.dealer._id] },
                });

                const productCount = await Product.countDocuments({
                    dealer: new Types.ObjectId(dealer.dealer._id),
                });

                return {
                    ...dealer.toObject(),
                    srCount,
                    productCount,
                };
            })
        );

        return {
            result: dealersWithCounts,
            meta,
        };
    }

    return { result, meta };
};

// get single dealer
const getSingleDealerFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const result = Dealer.findOne({ dealer: user._id })
        .populate('dealer')
        .populate('companies');
    return result;
};

// get single dealer with sr and product
const getSingleDealerWithSrAndProductFromDB = async (id: string) => {
    // Find the user first
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const dealer = await Dealer.findOne({ dealer: user._id })
        .populate('dealer')
        .populate('companies');

    if (!dealer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const srCount = await Sr.countDocuments({
        dealers: { $in: [user._id] },
    });

    const productCount = await Product.countDocuments({
        dealer: new Types.ObjectId(user._id),
    });

    return {
        ...dealer.toObject(),
        srCount,
        productCount,
    };
};

// assign companies to dealer
const assignCompaniesToDealerIntoDB = async (
    id: string,
    payload: { companies: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const dealerInfoData: {
        dealer: Types.ObjectId;
        companies: Types.ObjectId[];
    } = {
        dealer: user?._id,
        ...payload,
    };

    const result = await Dealer.findOneAndUpdate(
        { dealer: user?._id },
        dealerInfoData,
        { new: true }
    );
    return result;
};

// get dealer dashboard data
const getDealerDashboardDataFromDB = async (
    id: string,
    startDate: string,
    endDate: string
) => {
    const startDay = moment.tz(startDate, TIMEZONE).startOf('day').format();
    const endDay = moment.tz(endDate, TIMEZONE).endOf('day').format();

    const todaySales = await Order.aggregate([
        {
            $match: {
                dealer: new mongoose.Types.ObjectId(id),
                createdAt: {
                    $gte: moment().tz(TIMEZONE).startOf('day').format(),
                    $lte: moment().tz(TIMEZONE).endOf('day').format(),
                },
                status: { $in: ['Delivered'] },
            },
        },
        {
            $group: {
                _id: null,
                totalSellAmount: { $sum: '$collectionAmount' },
            },
        },
    ]);

    const totalSales = await Order.aggregate([
        {
            $match: {
                dealer: new mongoose.Types.ObjectId(id),
                createdAt: {
                    $gte: startDay,
                    $lte: endDay,
                },
                status: { $in: ['Delivered'] },
            },
        },
        {
            $group: {
                _id: null,
                totalSellAmount: { $sum: '$collectionAmount' },
            },
        },
    ]);

    const profit = await Order.aggregate([
        {
            $lookup: {
                from: 'orders',
                localField: 'order',
                foreignField: '_id',
                as: 'order',
            },
        },
        { $unwind: '$order' },
        {
            $match: {
                'order.dealer': new mongoose.Types.ObjectId(id),
                'order.createdAt': { $gte: startDay, $lte: endDay },
                'order.status': 'Delivered',
            },
        },
        { $unwind: '$products' },
        {
            $match: {
                'products.isCancelled.isCancelled': { $ne: true },
            },
        },
        {
            $project: {
                profit: {
                    $subtract: [
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                        { $ifNull: ['$products.totalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalProfit: { $sum: '$profit' },
            },
        },
    ]);

    const topSrs = await Order.aggregate([
        {
            $match: {
                dealer: new mongoose.Types.ObjectId(id),
                createdAt: {
                    $gte: startDay,
                    $lte: endDay,
                },
                status: { $in: ['Delivered'] },
                sr: { $exists: true, $ne: null },
            },
        },
        {
            $group: {
                _id: '$sr',
                totalSales: { $sum: '$collectionAmount' },
            },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'srInfo',
            },
        },
        { $unwind: '$srInfo' },
        {
            $project: {
                srId: '$_id',
                totalSales: 1,
                name: '$srInfo.name',
                profileImg: '$srInfo.profileImg',
            },
        },
    ]);

    return {
        todaySales: todaySales[0]?.totalSellAmount || 0,
        totalSales: totalSales[0]?.totalSellAmount || 0,
        profit: profit[0]?.totalProfit || 0,
        topSrs: topSrs,
    };
};

// get dealer stock data
const getDealerStockDataFromDB = async (
    id: string,
    query: Record<string, unknown>
) => {
    const dateFilter: Record<string, unknown> = {};
    if (query?.createdAt) {
        dateFilter.createdAt = {
            $gte: moment
                .tz(
                    (query.createdAt as { gte: string; lte: string }).gte,
                    TIMEZONE
                )
                .startOf('day')
                .format(),
            $lte: moment
                .tz(
                    (query.createdAt as { gte: string; lte: string }).lte,
                    TIMEZONE
                )
                .endOf('day')
                .format(),
        };
    }

    const user = await User.findOne({ id, isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dealer Found');
    }

    const totalDamage = await Damage.aggregate([
        {
            $match: {
                dealer: user._id,
                ...dateFilter,
            },
        },
        {
            $group: {
                _id: null,
                totalDamage: { $sum: '$amount' },
            },
        },
    ]);

    const totalSellValue = await Order.aggregate([
        {
            $match: {
                dealer: user._id,
                status: { $in: ['Delivered', 'Baki'] },
                ...dateFilter,
            },
        },
        {
            $group: {
                _id: null,
                totalSellValue: { $sum: '$collectionAmount' },
            },
        },
    ]);

    const totalProfit = await Order.aggregate([
        {
            $match: {
                dealer: user._id,
                status: { $in: ['Delivered', 'Baki'] },
                ...dateFilter,
            },
        },
        { $unwind: '$products' },
        {
            $match: {
                'products.isCancelled.isCancelled': { $ne: true },
            },
        },
        {
            $project: {
                profit: {
                    $subtract: [
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                        { $ifNull: ['$products.totalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalProfit: { $sum: '$profit' },
            },
        },
    ]);

    const totalOverCommission = await Order.aggregate([
        {
            $match: {
                dealer: user._id,
                status: { $in: ['Delivered', 'Baki'] },
                ...dateFilter,
            },
        },
        { $unwind: '$products' },
        {
            $match: {
                'products.isCancelled.isCancelled': { $ne: true },
            },
        },
        {
            $project: {
                overCommission: {
                    $subtract: [
                        { $ifNull: ['$products.srTotalAmount', 0] },
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOverCommission: { $sum: '$overCommission' },
            },
        },
    ]);

    return {
        totalSellValue: totalSellValue[0]?.totalSellValue || 0,
        profit: totalProfit[0]?.totalProfit || 0,
        totalOverCommission: totalOverCommission[0]?.totalOverCommission || 0,
        totalDamage: totalDamage[0]?.totalDamage || 0,
    };
};

export const DealerServices = {
    getAllDealerFromDB,
    getAllDealerByUserFromDB,
    getAllDealerWithSrAndProductFromDB,
    getSingleDealerFromDB,
    getSingleDealerWithSrAndProductFromDB,
    assignCompaniesToDealerIntoDB,
    getDealerDashboardDataFromDB,
    getDealerStockDataFromDB,
};
