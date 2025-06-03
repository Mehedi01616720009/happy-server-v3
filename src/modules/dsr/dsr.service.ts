import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { Dsr } from './dsr.model';
import { Types } from 'mongoose';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { Order } from '../order/order.model';
import { Damage } from '../damage/damage.model';
import { CustomerCareData } from '../customerCare/customerCare.model';

// get all dsr
const getAllDsrFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Dsr.find().populate('dsr').populate('upazilas'),
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

// get single dsr
const getSingleDsrFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Dsr Found');
    }

    const result = Dsr.findOne({ dsr: user._id })
        .populate('dsr')
        .populate('upazilas');
    return result;
};

// assign upazilas to dsr
const assignUpazilasToDsrIntoDB = async (
    id: string,
    payload: { upazilas: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    const dsrInfoData: {
        dsr: Types.ObjectId;
        upazilas: Types.ObjectId[];
    } = {
        dsr: user._id,
        ...payload,
    };

    const result = await Dsr.findOneAndUpdate({ dsr: user?._id }, dsrInfoData, {
        new: true,
    });
    return result;
};

// get dsr widget data
const getDsrWidgetDataFromDB = async (id: string, area: string | string[]) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No dsr Found');
    }

    if (typeof area === 'string') {
        area = [area];
    }

    const startDay = moment().tz(TIMEZONE).startOf('day').format();
    const endDay = moment().tz(TIMEZONE).endOf('day').format();

    const delivered = await Order.countDocuments({
        status: 'Delivered',
        createdAt: {
            $gte: startDay,
            $lte: endDay,
        },
    });

    const cancelled = await Order.countDocuments({
        status: 'Cancelled',
        createdAt: {
            $gte: startDay,
            $lte: endDay,
        },
    });

    const paid = await Order.countDocuments({
        status: 'Delivered',
        paymentStatus: 'Paid',
        createdAt: {
            $gte: startDay,
            $lte: endDay,
        },
    });

    const damage = await Damage.countDocuments({
        dsr: user._id,
        createdAt: {
            $gte: startDay,
            $lte: endDay,
        },
    });

    const pendingOrders = await CustomerCareData.find({
        requestType: 'Pending',
        status: 'Interest',
        requestDate: {
            $gte: startDay,
            $lte: endDay,
        },
    }).select('order');

    const pendingOrdersIds = pendingOrders.map(order => order.order);

    const pending = await Order.countDocuments({
        $and: [
            { _id: { $in: pendingOrdersIds } },
            { status: 'Pending' },
            { area: { $in: area } },
        ],
    });

    const bakiOrders = await CustomerCareData.find({
        requestType: 'Baki',
        status: 'Interest',
        requestDate: {
            $gte: startDay,
            $lte: endDay,
        },
    }).select('order');

    const bakiOrdersIds = bakiOrders.map(order => order.order);

    const baki = await Order.countDocuments({
        $and: [
            { _id: { $in: bakiOrdersIds } },
            { status: 'Baki' },
            { area: { $in: area } },
        ],
    });

    return {
        delivered,
        cancelled,
        paid,
        damage,
        pending,
        baki,
    };
};

export const DsrServices = {
    getAllDsrFromDB,
    getSingleDsrFromDB,
    assignUpazilasToDsrIntoDB,
    getDsrWidgetDataFromDB,
};
