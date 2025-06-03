import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SrServices } from './sr.service';

// get all sr controller
const getAllSr = catchAsync(async (req, res) => {
    const result = await SrServices.getAllSrFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Sr have been retrieved successfully',
        data: result,
    });
});

// get single sr controller
const getSingleSr = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await SrServices.getSingleSrFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sr has been retrieved successfully',
        data: result,
    });
});

// get sr dashboard data controller
const getSrDashboardData = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await SrServices.getSrDashboardDataFromDB(id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sr Dashboard data has been retrieved successfully',
        data: result,
    });
});

// get sr overview controller
const getSrOverview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await SrServices.getSrOverviewFromDB(id, req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Sr overview has been retrieved successfully',
        data: result,
    });
});

// update sr info controller
const updateSrInfo = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await SrServices.updateSrInfoIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Sr info has been updated successfully',
        data: result,
    });
});

export const SrControllers = {
    getAllSr,
    getSingleSr,
    getSrDashboardData,
    updateSrInfo,
    getSrOverview,
};
