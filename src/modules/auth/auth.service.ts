import { IAuth } from './auth.interface';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';
import createToken from '../../utils/createToken';
import verifyToken from '../../utils/verifyToken';
import passwordHash from '../../utils/passwordHash';
import { USER_ROLES } from '../user/user.constant';
import { Dealer } from '../dealer/dealer.model';
import { Sr } from '../sr/sr.model';
import { Freelancer } from '../freelancer/freelancer.model';
import moment from 'moment-timezone';
import { TIMEZONE } from '../../constant';
import { Packingman, Pickupman } from '../pickupMan/pickupMan.model';
import { Company } from '../company/company.model';

// signin
const signInFromDB = async (payload: IAuth) => {
    const user = await User.findOne({ phone: payload.phone }).select(
        '+password'
    );
    if (!user) {
        throw new AppError(httpStatus.FORBIDDEN, 'Phone or Password is wrong');
    }

    if (user.isDeleted === true) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    if (user.status === 'Blocked') {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const isPasswordMatched = await User.isPasswordMatched(
        payload.password,
        user.password
    );
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.FORBIDDEN, 'Phone or Password is wrong');
    }

    const jwtPayload = {
        userId: user.id,
        role: user.role,
    };

    const accessToken = await createToken(
        jwtPayload,
        config.accessSecret as string,
        config.accessTokenExp as string
    );

    const refreshToken = await createToken(
        jwtPayload,
        config.refreshSecret as string,
        config.refreshTokenExp as string
    );

    return {
        accessToken,
        refreshToken,
    };
};

// get me
const getMeFromDB = async (payload: JwtPayload) => {
    const user = await User.findOne({
        id: payload.userId,
        status: 'Active',
        isDeleted: false,
    }).select('_id');
    if (!user) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are unauthorized');
    }

    let result = null;

    if (payload.role === USER_ROLES.dealer) {
        result = await Dealer.findOne({ dealer: user._id })
            .populate('dealer')
            .populate('companies');
    } else if (payload.role === USER_ROLES.sr) {
        result = await Sr.findOne({ sr: user._id })
            .populate('sr')
            .populate('dealers')
            .populate('companies')
            .populate('upazilas')
            .populate('warehouse');
    } else if (payload.role === USER_ROLES.pickupMan) {
        result = await Pickupman.findOne({ pickupman: user._id })
            .populate('pickupman')
            .populate('warehouse');
    } else if (payload.role === USER_ROLES.packingMan) {
        result = await Packingman.findOne({ packingman: user._id })
            .populate('packingman')
            .populate('warehouse');
    } else if (payload.role === USER_ROLES.freelancer) {
        result = await Freelancer.findOne({ freelancer: user._id })
            .populate('freelancer')
            .populate('upazilas');
    } else if (payload.role === USER_ROLES.deliveryMan) {
        const user = await User.findOne({
            id: payload.userId,
        });
        const companies = await Company.find();
        result = { ...user?.toObject(), companies };
    } else {
        result = await User.findOne({
            id: payload.userId,
        });
    }

    return result;
};

// get new access token by refresh token
const getNewAccessTokenByRefreshToken = async (token: string) => {
    const decoded = await verifyToken(token, config.refreshSecret as string);
    const user = await User.findOne({
        id: (decoded as JwtPayload).userId,
        status: 'Active',
        isDeleted: false,
    });
    if (!user) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const jwtPayload = {
        userId: user.id,
        role: user.role,
    };

    const accessToken = await createToken(
        jwtPayload,
        config.accessSecret as string,
        config.accessTokenExp as string
    );

    return { accessToken };
};

// forget password reset link only
const forgetPasswordLinkGenerate = async (payload: { phone: string }) => {
    const user = await User.isUserExistByPhone(payload.phone);
    if (!user) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    if (user.isDeleted === true) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    if (user.status === 'Blocked') {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const jwtPayload = {
        userId: user.id,
        role: user.role,
    };

    // create access token for reset password
    const accessToken = await createToken(
        jwtPayload,
        config.accessSecret as string,
        '10m'
    );

    const resetLink = `${config.frontendUrl}/auth/reset-password?token=${accessToken}`;
    return resetLink;
};

// reset password reset link only
const resetPasswordIntoDB = async (
    userData: JwtPayload,
    payload: { password: string }
) => {
    const user = await User.findOne({
        id: userData.userId,
        status: 'Active',
        isDeleted: false,
    });
    if (!user) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'Sorry, Something is suspecious'
        );
    }

    const password = await passwordHash(payload.password as string);

    const result = User.findOneAndUpdate(
        { id: userData.userId },
        { password, updatedAt: new Date(moment().tz(TIMEZONE).format()) },
        { new: true }
    );

    return result;
};

export const AuthServices = {
    signInFromDB,
    getMeFromDB,
    getNewAccessTokenByRefreshToken,
    forgetPasswordLinkGenerate,
    resetPasswordIntoDB,
};
