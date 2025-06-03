import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserRouteServices } from './userRoute.service';

// create user route controller
const createUserRoute = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserRouteServices.createUserRouteIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User route has been created successfully',
        data: result,
    });
});

// get single user route controller
const getSingleUserRoute = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserRouteServices.getSingleUserRouteFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User route has been retrieved successfully',
        data: result,
    });
});

// create sr route day controller
const createSrRouteDay = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserRouteServices.createSrRouteDayIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sr route day has been created successfully',
        data: result,
    });
});

// get single sr route day controller
const getSingleSrRouteDay = catchAsync(async (req, res) => {
    const { id, date } = req.params;
    const result = await UserRouteServices.getSingleSrRouteDayFromDB(id, date);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sr route day has been retrieved successfully',
        data: result,
    });
});

// delete user route controller
const deleteUserRoute = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UserRouteServices.deleteUserRouteFromDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User route has been deleted successfully',
        data: result,
    });
});

export const UserRouteControllers = {
    createUserRoute,
    getSingleUserRoute,
    createSrRouteDay,
    getSingleSrRouteDay,
    deleteUserRoute,
};
