import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ISr } from './sr.interface';
import { Sr } from './sr.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order, OrderDetails } from '../order/order.model';
import mongoose, { Types } from 'mongoose';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';

// get all sr
const getAllSrFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Sr.find()
            .populate('sr')
            .populate('dealers')
            .populate('companies')
            .populate('upazilas')
            .populate('warehouse'),
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

// get single sr
const getSingleSrFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Sr Found');
    }

    const result = Sr.findOne({ sr: user._id })
        .populate('sr')
        .populate('dealers')
        .populate('companies')
        .populate('upazilas')
        .populate('warehouse');
    return result;
};

// get sr overview
const getSrOverviewFromDB = async (
    id: string,
    query: Record<string, unknown>
) => {
    const sr = await User.findOne({ id });
    if (!sr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No SR Found');
    }

    const fetchQuery = new QueryBuilder(
        Order.find({ sr: sr?._id, status: 'Delivered' }).select('_id'),
        query
    )
        .filter()
        .sort()
        .fields();

    const orders = await fetchQuery.modelQuery;
    if (!orders) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderIDs = orders.map(order => new Types.ObjectId(order._id));

    const orderDetailsResult = await OrderDetails.aggregate([
        { $match: { order: { $in: orderIDs } } },
        { $unwind: '$products' },
        {
            $match: {
                $or: [
                    { 'products.isCancelled.isCancelled': { $exists: false } },
                    { 'products.isCancelled.isCancelled': false },
                ],
            },
        },
        {
            $addFields: {
                oc: {
                    $subtract: [
                        '$products.totalAmount',
                        { $ifNull: ['$products.srTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOc: { $sum: '$oc' },
                totalSaleAmount: {
                    $sum: { $ifNull: ['$products.srTotalAmount', 0] },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalOc: 1,
                totalSaleAmount: 1,
            },
        },
    ]);

    const fetchQueryForOrderAggregate = new QueryBuilder(
        Order.find({ sr: sr?._id }).select('_id'),
        query
    )
        .filter()
        .sort()
        .fields();

    const ordersForOrderAggregate =
        await fetchQueryForOrderAggregate.modelQuery;
    if (!ordersForOrderAggregate) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Order Found');
    }

    const orderIDsForOrderAggregate = orders.map(
        order => new Types.ObjectId(order._id)
    );

    const orderStatsResult = await Order.aggregate([
        { $match: { _id: { $in: orderIDsForOrderAggregate } } },
        {
            $group: {
                _id: null,
                totalOrder: { $sum: 1 },
                deliveredOrder: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0],
                    },
                },
                cancelledOrder: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalOrder: 1,
                deliveredOrder: 1,
                cancelledOrder: 1,
            },
        },
    ]);

    return {
        totalOc:
            orderDetailsResult.length > 0 ? orderDetailsResult[0].totalOc : 0,
        totalOrder:
            orderStatsResult.length > 0 ? orderStatsResult[0].totalOrder : 0,
        deliveredOrder:
            orderStatsResult.length > 0
                ? orderStatsResult[0].deliveredOrder
                : 0,
        cancelledOrder:
            orderStatsResult.length > 0
                ? orderStatsResult[0].cancelledOrder
                : 0,
    };
};

// update sr info
const updateSrInfoIntoDB = async (
    id: string,
    payload: Pick<ISr, 'dealers' | 'companies' | 'upazilas' | 'warehouse'>
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Sr Found');
    }

    const srInfoData = {
        ...payload,
    };

    const result = await Sr.findOneAndUpdate({ sr: user?._id }, srInfoData, {
        new: true,
    });
    return result;
};

// get sr dashboard data
const getSrDashboardDataFromDB = async (
    id: string,
    startDate: string,
    endDate: string
) => {
    const startDay = moment.tz(startDate, TIMEZONE).startOf('day').format();
    const endDay = moment.tz(endDate, TIMEZONE).endOf('day').format();

    const totalSales = await Order.aggregate([
        {
            $match: {
                sr: new mongoose.Types.ObjectId(id),
                createdAt: { $gte: startDay, $lte: endDay },
                status: 'Delivered',
            },
        },
        {
            $group: {
                _id: null,
                totalSellAmount: { $sum: '$collectionAmount' },
            },
        },
    ]);

    const oc = await OrderDetails.aggregate([
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
                'order.sr': new mongoose.Types.ObjectId(id),
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
                oc: {
                    $subtract: [
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                        { $ifNull: ['$products.srTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOC: { $sum: '$oc' },
            },
        },
    ]);

    const orderSummary = await Order.aggregate([
        {
            $match: {
                sr: new mongoose.Types.ObjectId(id),
                createdAt: { $gte: startDay, $lte: endDay },
            },
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalDelivered: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0],
                    },
                },
                totalCancelled: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0],
                    },
                },
            },
        },
    ]);

    return {
        totalSales: totalSales[0]?.totalSellAmount || 0,
        profit: oc[0]?.totalOC || 0,
        summary: orderSummary[0] || {},
    };
};

// get sr home data
const getSrHomeDataFromDB = async (
    id: string,
    query: Record<string, unknown>
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Sr Found');
    }

    const createdAt: { gte: string; lte: string } = query?.createdAt as {
        gte: string;
        lte: string;
    };

    const startDay = moment
        .tz(createdAt?.gte, TIMEZONE)
        .startOf('day')
        .format();
    const endDay = moment.tz(createdAt?.lte, TIMEZONE).endOf('day').format();

    const todaySales = await Order.aggregate([
        {
            $match: {
                sr: user._id,
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
                sr: user._id,
                createdAt: { $gte: startDay, $lte: endDay },
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

    const oc = await OrderDetails.aggregate([
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
                'order.sr': user._id,
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
                oc: {
                    $subtract: [
                        { $ifNull: ['$products.dealerTotalAmount', 0] },
                        { $ifNull: ['$products.srTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOC: { $sum: '$oc' },
            },
        },
    ]);

    return {
        todaySales: todaySales[0]?.totalSellAmount || 0,
        totalSales: totalSales[0]?.totalSellAmount || 0,
        profit: oc[0]?.totalOC || 0,
    };
};

export const SrServices = {
    getAllSrFromDB,
    getSingleSrFromDB,
    getSrOverviewFromDB,
    updateSrInfoIntoDB,
    getSrDashboardDataFromDB,
    getSrHomeDataFromDB,
};
