import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IFreelancerWorkingData } from './freelancer.interface';
import { Freelancer, FreelancerWorkingData } from './freelancer.model';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { TIMEZONE } from '../../constant';
import moment from 'moment-timezone';

// get all freelancer
const getAllFreelancerFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(
        Freelancer.find().populate('freelancer').populate('upazilas'),
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

// get single freelancer
const getSingleFreelancerFromDB = async (id: string) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    const result = Freelancer.findOne({ freelancer: user._id })
        .populate('freelancer')
        .populate('upazilas');
    return result;
};

// get freelancer overview
const getFreelancerOverviewFromDB = async (id: string, date: string | null) => {
    const user = await User.findOne({
        id,
        status: 'Active',
        isDeleted: false,
    });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    let retailers = [];
    let totalAdded = 0;
    let totalEdited = 0;

    if (date) {
        const startOfDay = moment.tz(date, TIMEZONE).startOf('day').format();
        const endOfDay = moment.tz(date, TIMEZONE).endOf('day').format();
        const matchConditions = { $gte: startOfDay, $lte: endOfDay };

        retailers = await FreelancerWorkingData.find({
            $or: [
                {
                    $and: [
                        { addedBy: user._id },
                        { createdAt: matchConditions },
                    ],
                },
                {
                    $and: [
                        { editedBy: user._id },
                        { updatedAt: matchConditions },
                    ],
                },
            ],
        }).populate('retailer');

        totalAdded = await FreelancerWorkingData.countDocuments({
            $and: [{ addedBy: user._id }, { createdAt: matchConditions }],
        });
        totalEdited = await FreelancerWorkingData.countDocuments({
            $and: [{ editedBy: user._id }, { updatedAt: matchConditions }],
        });
    } else {
        retailers = await FreelancerWorkingData.find({
            $or: [{ addedBy: user._id }, { editedBy: user._id }],
        }).populate('retailer');

        totalAdded = await FreelancerWorkingData.countDocuments({
            addedBy: user._id,
        });
        totalEdited = await FreelancerWorkingData.countDocuments({
            editedBy: user._id,
        });
    }

    return { retailers, totalAdded, totalEdited };
};

// assign upazilas to freelancer
const assignUpazilasToFreelancerIntoDB = async (
    id: string,
    payload: { upazilas: Types.ObjectId[] }
) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
    }

    const freelancerInfoData: {
        freelancer: Types.ObjectId;
        upazilas: Types.ObjectId[];
    } = {
        freelancer: user._id,
        ...payload,
    };

    const result = await Freelancer.findOneAndUpdate(
        { freelancer: user?._id },
        freelancerInfoData,
        { new: true }
    );
    return result;
};

// update freelancer work
const updateFreelancerWorkIntoDB = async (
    id: string,
    payload: { addedBy?: Types.ObjectId; editedBy?: Types.ObjectId }
) => {
    const retailer = await User.findOne({
        id,
        status: 'Active',
        isDeleted: false,
    });
    if (!retailer) {
        throw new AppError(httpStatus.NOT_FOUND, 'No Retailer Found');
    }

    const freelancerWorkData: Partial<IFreelancerWorkingData> = {
        retailer: retailer?._id,
        updatedAt: moment().tz(TIMEZONE).format(),
    };

    if (payload?.addedBy) {
        const user = await User.findOne({
            id: payload?.addedBy,
            status: 'Active',
            isDeleted: false,
        });
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
        }

        freelancerWorkData.addedBy = user._id;
    } else if (payload?.editedBy) {
        const user = await User.findOne({
            id: payload?.editedBy,
            status: 'Active',
            isDeleted: false,
        });
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, 'No Freelancer Found');
        }

        freelancerWorkData.editedBy = user._id;
    }

    const prevWork = await FreelancerWorkingData.findOne({
        retailer: retailer?._id,
    });
    if (prevWork?.addedBy) {
        if (payload?.addedBy) {
            throw new AppError(
                httpStatus.CONFLICT,
                'This retailer has already added by someone'
            );
        }

        if (prevWork?.addedBy === payload?.editedBy) {
            delete freelancerWorkData.editedBy;
        }
    }

    const result = await FreelancerWorkingData.findOneAndUpdate(
        { retailer: retailer?._id },
        freelancerWorkData,
        { upsert: true, new: true }
    );
    return result;
};

export const FreelancerServices = {
    getAllFreelancerFromDB,
    getSingleFreelancerFromDB,
    getFreelancerOverviewFromDB,
    assignUpazilasToFreelancerIntoDB,
    updateFreelancerWorkIntoDB,
};
