import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

// signin controller
const signIn = catchAsync(async (req, res) => {
    const result = await AuthServices.signInFromDB(req.body);
    const { refreshToken } = result;
    res.cookie('refreshToken', refreshToken, {
        secure: config.nodeEnv === 'production',
        httpOnly: true,
    });
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User has logged in successfully',
        data: { token: result.accessToken },
    });
});

// get me controller
const getMe = catchAsync(async (req, res) => {
    const result = await AuthServices.getMeFromDB(req.user);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User has been retrieved successfully',
        data: result,
    });
});

// get new access token controller
const getNewAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;
    const result = await AuthServices.getNewAccessTokenByRefreshToken(
        refreshToken
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Access token has been generated successfully',
        data: result,
    });
});

// forget password controller
const forgetPassword = catchAsync(async (req, res) => {
    const result = await AuthServices.forgetPasswordLinkGenerate(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reset link has been generated successfully',
        data: result, // in production, must change to null
    });
});

// reset password controller
const resetPassword = catchAsync(async (req, res) => {
    const result = await AuthServices.resetPasswordIntoDB(req.user, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password has been changed successfully',
        data: result,
    });
});

export const AuthControllers = {
    signIn,
    getMe,
    getNewAccessToken,
    forgetPassword,
    resetPassword,
};
