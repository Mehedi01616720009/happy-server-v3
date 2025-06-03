import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { ICustomerCareData } from './customerCare.interface';
import { CustomerCareData } from './customerCare.model';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { User } from '../user/user.model';
import { Order } from '../order/order.model';
import mongoose from 'mongoose';

// create customer care data
const createCustomerCareDataIntoDB = async (payload: ICustomerCareData) => {
    const order = await Order.findOne({ id: payload?.order });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order Found');
    }
    payload.order = order._id;

    const retailer = await User.findOne({ id: payload?.retailer });
    if (!retailer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Retailer Found');
    }
    payload.retailer = retailer._id;

    const dsr = await User.findOne({
        id: payload?.dsr,
        status: 'Active',
        isDeleted: false,
    });
    if (!dsr) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr Found');
    }
    payload.dsr = dsr._id;

    if (payload?.requestDate) {
        payload.requestDate = moment
            .tz(payload?.requestDate, TIMEZONE)
            .startOf('day')
            .format();
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await CustomerCareData.findOneAndUpdate(
            { order: payload.order },
            payload,
            { upsert: true, session, new: true }
        );

        await Order.findByIdAndUpdate(
            order._id,
            {
                status: payload.requestType,
                updatedAt: moment().tz(TIMEZONE).format(),
            },
            { session, new: true }
        );

        await session.commitTransaction();
        await session.endSession();

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

// get all customer care data
const getAllCustomerCareDataFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        CustomerCareData.find()
            .populate('order')
            .populate('retailer')
            .populate('dsr'),
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

// update not reach customer care data
const updateNotReachCustomerCareDataIntoDB = async (id: string) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order Found');
    }

    const customerCareData = await CustomerCareData.findOne({
        order: order._id,
    });
    if (!customerCareData) {
        throw new AppError(httpStatus.NOT_FOUND, 'No customer care data found');
    }

    const result = CustomerCareData.findOneAndUpdate(
        { order: order._id },
        { status: 'Not Reach', updatedAt: moment().tz(TIMEZONE).format() },
        { new: true }
    );
    return result;
};

// update not interest customer care data
const updateNotInterestCustomerCareDataIntoDB = async (
    id: string,
    payload: { status: 'Not Interest'; notInterestReason: string }
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order Found');
    }

    const customerCareData = await CustomerCareData.findOne({
        order: order._id,
    });
    if (!customerCareData) {
        throw new AppError(httpStatus.NOT_FOUND, 'No customer care data found');
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const result = await CustomerCareData.findOneAndUpdate(
            { order: order._id },
            { ...payload, updatedAt: moment().tz(TIMEZONE).format() },
            { session, new: true }
        );

        if (customerCareData?.requestType === 'Pending') {
            await Order.findByIdAndUpdate(
                order._id,
                {
                    status: 'Cancelled',
                    updatedAt: moment().tz(TIMEZONE).format(),
                },
                { session, new: true }
            );
        }

        await session.commitTransaction();
        await session.endSession();

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

// update interest customer care data
const updateInterestCustomerCareDataIntoDB = async (
    id: string,
    payload: { status: 'Interest'; requestDate: string }
) => {
    const order = await Order.findOne({ id });
    if (!order) {
        throw new AppError(httpStatus.NOT_FOUND, 'No order Found');
    }

    const customerCareData = await CustomerCareData.findOne({
        order: order._id,
    });
    if (!customerCareData) {
        throw new AppError(httpStatus.NOT_FOUND, 'No customer care data found');
    }

    payload.requestDate = moment
        .tz(payload?.requestDate, TIMEZONE)
        .startOf('day')
        .format();
    const result = CustomerCareData.findOneAndUpdate(
        { order: order._id },
        { ...payload, updatedAt: moment().tz(TIMEZONE).format() },
        { new: true }
    );
    return result;
};

export const CustomerCareDataServices = {
    createCustomerCareDataIntoDB,
    getAllCustomerCareDataFromDB,
    updateNotReachCustomerCareDataIntoDB,
    updateNotInterestCustomerCareDataIntoDB,
    updateInterestCustomerCareDataIntoDB,
};
