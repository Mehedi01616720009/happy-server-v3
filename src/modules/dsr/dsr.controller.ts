import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DsrServices } from './dsr.service';

// get all dsr controller
const getAllDsr = catchAsync(async (req, res) => {
    const result = await DsrServices.getAllDsrFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Dsr have been retrieved successfully',
        data: result,
    });
});

// get single dsr controller
const getSingleDsr = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DsrServices.getSingleDsrFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dsr has been retrieved successfully',
        data: result,
    });
});

// assign data to dsr controller
const assignDataToDsr = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DsrServices.assignDataToDsrIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Dsr info has been updated successfully',
        data: result,
    });
});

// get dsr widget data controller
const getDsrWidgetData = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { area } = req.query;
    const result = await DsrServices.getDsrWidgetDataFromDB(
        id,
        area as string | string[]
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dsr data has been retrieved successfully',
        data: result,
    });
});

export const DsrControllers = {
    getAllDsr,
    getSingleDsr,
    assignDataToDsr,
    getDsrWidgetData,
};
