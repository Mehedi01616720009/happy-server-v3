import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AreaServices } from './area.service';

// create area controller
const createArea = catchAsync(async (req, res) => {
    const result = await AreaServices.createAreaIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Area has been created successfully',
        data: result,
    });
});

// get all area controller
const getAllArea = catchAsync(async (req, res) => {
    const result = await AreaServices.getAllAreaFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All areas have been retrieved successfully',
        data: result,
    });
});

// get single area controller
const getSingleArea = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await AreaServices.getSingleAreaFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Area has been retrieved successfully',
        data: result,
    });
});

// update area controller
const updateArea = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await AreaServices.updateAreaIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Area has been updated successfully',
        data: result,
    });
});

export const AreaControllers = {
    createArea,
    getAllArea,
    getSingleArea,
    updateArea,
};
