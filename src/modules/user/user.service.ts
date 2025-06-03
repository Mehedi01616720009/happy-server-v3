import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IChangePassword, IUser } from './user.interface';
import { User } from './user.model';
import config from '../../config';
import generateUserId from '../../utils/generateUserId';
import passwordHash from '../../utils/passwordHash';
import generateImageName from '../../utils/generateImageName';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { userSearchableFields } from './user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import { TIMEZONE } from '../../constant';
import moment from 'moment-timezone';
import mongoose from 'mongoose';
import { Dealer } from '../dealer/dealer.model';
import { Sr } from '../sr/sr.model';
import { Freelancer } from '../freelancer/freelancer.model';
import { Dsr } from '../dsr/dsr.model';
import { Packingman, Pickupman } from '../pickupMan/pickupMan.model';

// create user
const createUserIntoDB = async (file: Express.Multer.File, payload: IUser) => {
    const user = await User.isUserExistByPhone(payload.phone);
    if (user?.phone) {
        throw new AppError(httpStatus.IM_USED, 'This phone has already exist');
    }

    const userData: Partial<IUser> = {
        ...payload,
        password: config.defaultPassword,
        profileImg: config.profileImg,
    };

    userData.id = await generateUserId(payload.name, payload.phone);
    userData.password = await passwordHash(userData.password as string);

    if (file?.path) {
        // generate image name
        const imageName = generateImageName(userData.id);

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        userData.profileImg = image?.secure_url;
    }

    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const createdUser = await User.create([userData], { session });

        if (userData?.role === 'dealer') {
            const dealerData = {
                dealer: createdUser[0]?._id,
                companies: [],
            };

            await Dealer.create([dealerData], { session });
        }

        if (userData?.role === 'pickupMan') {
            const pickupManData = {
                pickupman: createdUser[0]?._id,
            };

            await Pickupman.create([pickupManData], { session });
        }

        if (userData?.role === 'packingMan') {
            const packingManData = {
                packingman: createdUser[0]?._id,
            };

            await Packingman.create([packingManData], { session });
        }

        if (userData?.role === 'sr') {
            const srData = {
                sr: createdUser[0]?._id,
                dealers: [],
                companies: [],
                upazilas: [],
            };

            await Sr.create([srData], { session });
        }

        if (userData?.role === 'deliveryMan') {
            const dsrData = {
                dsr: createdUser[0]?._id,
                upazilas: [],
            };

            await Dsr.create([dsrData], { session });
        }

        if (userData?.role === 'freelancer') {
            const freelancerData = {
                freelancer: createdUser[0]?._id,
                upazilas: [],
            };

            await Freelancer.create([freelancerData], { session });
        }

        await session.commitTransaction();
        await session.endSession();

        return createdUser;
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

// get all user
const getAllUserFromDB = async (query: Record<string, unknown>) => {
    const fetchQuery = new QueryBuilder(User.find(), query)
        .search(userSearchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await fetchQuery.modelQuery;
    const meta = await fetchQuery.countTotal();
    return { result, meta };
};

// get single user
const getSingleUserFromDB = async (id: string) => {
    const result = User.findOne({ id });
    return result;
};

// change password
const changePasswordIntoDB = async (id: string, payload: IChangePassword) => {
    const user = await User.findOne({
        id,
        status: 'Active',
        isDeleted: false,
    }).select('+password');
    if (!user) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const isPasswordMatched = await User.isPasswordMatched(
        payload.oldPassword,
        user.password
    );
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.FORBIDDEN, 'Old Password is wrong');
    }

    const password = await passwordHash(payload.newPassword as string);
    const updatedData: {
        password: string;
        needPasswordChange?: boolean;
        updatedAt?: string;
    } = {
        password,
        updatedAt: moment().tz(TIMEZONE).format(),
    };

    if (user?.needPasswordChange === true) {
        updatedData.needPasswordChange = false;
    }

    const result = User.findOneAndUpdate({ id }, updatedData, { new: true });
    return result;
};

// update user image
const updateUserImageIntoDB = async (id: string, file: Express.Multer.File) => {
    const user = await User.findOne({ id, status: 'Active', isDeleted: false });
    if (!user) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const userData: { profileImg?: string; updatedAt?: string } = {
        updatedAt: moment().tz(TIMEZONE).format(),
    };

    if (file?.path) {
        // generate image name
        const imageName = generateImageName(user.id);

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        userData.profileImg = image?.secure_url;
    }

    const result = await User.findOneAndUpdate({ id }, userData, { new: true });
    return result;
};

// change user status
const changeUserStatusIntoDB = async (
    id: string,
    payload: { status: 'Active' | 'Blocked' }
) => {
    const user = await User.findOne({ id, isDeleted: false });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'No user found');
    }

    const result = User.findOneAndUpdate(
        { id },
        { ...payload, updatedAt: moment().tz(TIMEZONE).format() },
        { new: true }
    );
    return result;
};

// delete user
const deleteUserFromDB = async (id: string) => {
    const result = User.findOneAndUpdate(
        { id },
        {
            isDeleted: true,
            updatedAt: moment().tz(TIMEZONE).format(),
        },
        { new: true }
    );
    return result;
};

export const UserServices = {
    createUserIntoDB,
    getAllUserFromDB,
    getSingleUserFromDB,
    changePasswordIntoDB,
    updateUserImageIntoDB,
    changeUserStatusIntoDB,
    deleteUserFromDB,
};
