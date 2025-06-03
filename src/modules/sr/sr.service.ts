import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { ISr } from './sr.interface';
import { Sr } from './sr.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Order, OrderDetails } from '../order/order.model';
import { Types } from 'mongoose';
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

// get sr dashboard data
const getSrDashboardDataFromDB = async (
    id: string,
    query: Record<string, unknown>
) => {
    const createdAt = {
        gte:
            query.createdAt &&
            typeof query.createdAt === 'object' &&
            'gte' in query.createdAt
                ? (query.createdAt.gte as string)
                : moment().tz(TIMEZONE).format(),
        lte:
            query.createdAt &&
            typeof query.createdAt === 'object' &&
            'lte' in query.createdAt
                ? (query.createdAt.lte as string)
                : moment().tz(TIMEZONE).format(),
    };
    if (!createdAt) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Missing Date');
    }

    const startOfDay = moment
        .tz(createdAt.gte, TIMEZONE)
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ');
    const endOfDay = moment
        .tz(createdAt.lte, TIMEZONE)
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ssZ');

    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Sr Found');
    }

    const totalOrder = await Order.countDocuments({
        sr: user._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const totalDeliveredOrder = await Order.countDocuments({
        sr: user._id,
        status: 'Delivered',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const ocOrders = await Order.find({
        sr: user._id,
        status: 'Delivered',
        createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).select('_id');
    const ocOrdersIds = ocOrders.map(order => order._id);

    const totalPriceOrders = await Order.find({
        sr: user._id,
        status: 'Delivered',
        createdAt: {
            $gte: moment()
                .tz(TIMEZONE)
                .startOf('day')
                .format('YYYY-MM-DDTHH:mm:ssZ'),
            $lte: moment()
                .tz(TIMEZONE)
                .endOf('day')
                .format('YYYY-MM-DDTHH:mm:ssZ'),
        },
    }).select('_id');
    const totalPriceOrdersIds = totalPriceOrders.map(order => order._id);

    const totalOcResult = await OrderDetails.aggregate([
        { $match: { order: { $in: ocOrdersIds } } },
        { $unwind: '$products' },
        {
            $addFields: {
                oc: {
                    $subtract: [
                        '$products.dealerTotalAmount',
                        { $ifNull: ['$products.srTotalAmount', 0] },
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                totalOc: { $sum: '$oc' },
            },
        },
    ]);

    const totalPriceResult = await OrderDetails.aggregate([
        { $match: { order: { $in: totalPriceOrdersIds } } },
        { $unwind: '$products' },
        {
            $group: {
                _id: null,
                totalPrice: { $sum: '$products.srTotalAmount' },
            },
        },
    ]);

    const totalOc = totalOcResult.length > 0 ? totalOcResult[0].totalOc : 0;
    const totalPrice =
        totalPriceResult.length > 0 ? totalPriceResult[0].totalPrice : 0;

    return {
        totalOrder,
        totalDeliveredOrder,
        totalOc,
        totalPrice,
    };
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

export const SrServices = {
    getAllSrFromDB,
    getSingleSrFromDB,
    getSrDashboardDataFromDB,
    getSrOverviewFromDB,
    updateSrInfoIntoDB,
};
