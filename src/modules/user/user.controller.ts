import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

// create user controller
const createUser = catchAsync(async (req, res) => {
    const result = await UserServices.createUserIntoDB(
        req?.file as Express.Multer.File,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User has been created successfully',
        data: result,
    });
});

// get all user controller
const getAllUser = catchAsync(async (req, res) => {
    const result = await UserServices.getAllUserFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All users have been retrieved successfully',
        data: result,
    });
});

// get single user controller
const getSingleUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.getSingleUserFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User has been retrieved successfully',
        data: result,
    });
});

// change password controller
const changePassword = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.changePasswordIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password has been changed successfully',
        data: result,
    });
});

// update user image controller
const updateUserImage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.updateUserImageIntoDB(
        id,
        req?.file as Express.Multer.File
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User image has been updated successfully',
        data: result,
    });
});

// change user status controller
const changeUserStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.changeUserStatusIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `User has been ${result?.status} successfully`,
        data: result,
    });
});

// delete user controller
const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserServices.deleteUserFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User has been deleted successfully',
        data: result,
    });
});

export const UserControllers = {
    createUser,
    getAllUser,
    getSingleUser,
    changePassword,
    updateUserImage,
    changeUserStatus,
    deleteUser,
};
