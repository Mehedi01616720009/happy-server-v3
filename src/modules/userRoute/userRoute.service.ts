import { Types } from 'mongoose';
import { User } from '../user/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { SrRouteDay, UserRoute } from './userRoute.model';

// create user route
const createUserRouteIntoDB = async (
    id: string,
    payload: { day: string; routes: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No User Found');
    }

    const result = await UserRoute.findOneAndUpdate(
        { user: user?._id },
        {
            user: user?._id,
            $addToSet: { [payload.day]: { $each: payload.routes } },
        },
        { upsert: true, new: true }
    );
    return result;
};

// get single user route
const getSingleUserRouteFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No User Found');
    }

    const result = await UserRoute.findOne({ user: user?._id })
        .populate('user')
        .populate('saturday')
        .populate('sunday')
        .populate('monday')
        .populate('tuesday')
        .populate('wednesday')
        .populate('thursday')
        .populate('friday');
    return result;
};

// create sr route day
const createSrRouteDayIntoDB = async (
    id: string,
    payload: { date: Date; routes: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Sr Found');
    }

    const result = await SrRouteDay.findOneAndUpdate(
        { user: user?._id, taskDate: payload.date },
        {
            user: user?._id,
            routes: payload.routes,
        },
        { upsert: true, new: true }
    );
    return result;
};

// get single sr route day
const getSingleSrRouteDayFromDB = async (id: string, date: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No User Found');
    }

    const result = await SrRouteDay.findOne({ user: user?._id, taskDate: date })
        .populate('user')
        .populate('routes');
    return result;
};

// delete user route
const deleteUserRouteFromDB = async (
    id: string,
    payload: { day: string; route: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No User Found');
    }

    const result = await UserRoute.findOneAndUpdate(
        { user: user?._id },
        { $pull: { [payload.day]: { $in: payload.route } } },
        { new: true }
    );
    return result;
};

export const UserRouteServices = {
    createUserRouteIntoDB,
    getSingleUserRouteFromDB,
    createSrRouteDayIntoDB,
    getSingleSrRouteDayFromDB,
    deleteUserRouteFromDB,
};
