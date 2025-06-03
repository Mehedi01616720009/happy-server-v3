import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CustomerCareDataServices } from './customerCare.service';

// create customer care data controller
const createCustomerCareData = catchAsync(async (req, res) => {
    const result = await CustomerCareDataServices.createCustomerCareDataIntoDB(
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Customer care data has been created successfully',
        data: result,
    });
});

// get all customer care data controller
const getAllCustomerCareData = catchAsync(async (req, res) => {
    const result = await CustomerCareDataServices.getAllCustomerCareDataFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Customer care data have been retrieved successfully',
        data: result,
    });
});

// update not reach customer care data controller
const updateNotReachCustomerCareData = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result =
        await CustomerCareDataServices.updateNotReachCustomerCareDataIntoDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Customer care data has been updated successfully',
        data: result,
    });
});

// update not interest customer care data controller
const updateNotInterestCustomerCareData = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result =
        await CustomerCareDataServices.updateNotInterestCustomerCareDataIntoDB(
            id,
            req.body
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Customer care data has been updated successfully',
        data: result,
    });
});

// update interest customer care data controller
const updateInterestCustomerCareData = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result =
        await CustomerCareDataServices.updateInterestCustomerCareDataIntoDB(
            id,
            req.body
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Customer care data has been updated successfully',
        data: result,
    });
});

export const CustomerCareDataControllers = {
    createCustomerCareData,
    getAllCustomerCareData,
    updateNotReachCustomerCareData,
    updateNotInterestCustomerCareData,
    updateInterestCustomerCareData,
};
