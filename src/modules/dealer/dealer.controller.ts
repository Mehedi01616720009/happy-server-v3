import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DealerServices } from './dealer.service';

// get all dealer controller
const getAllDealer = catchAsync(async (req, res) => {
    const result = await DealerServices.getAllDealerFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Dealers have been retrieved successfully',
        data: result,
    });
});

// get all dealer by user controller
const getAllDealerByUser = catchAsync(async (req, res) => {
    const result = await DealerServices.getAllDealerByUserFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Dealers have been retrieved successfully',
        data: result,
    });
});

// get all dealer with sr and product controller
const getAllDealerWithSrAndProduct = catchAsync(async (req, res) => {
    const result = await DealerServices.getAllDealerWithSrAndProductFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Dealers have been retrieved successfully',
        data: result,
    });
});

// get single dealer controller
const getSingleDealer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DealerServices.getSingleDealerFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dealer has been retrieved successfully',
        data: result,
    });
});

// get single dealer with sr and product controller
const getSingleDealerWithSrAndProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DealerServices.getSingleDealerWithSrAndProductFromDB(
        id
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dealer has been retrieved successfully',
        data: result,
    });
});

// assign companies to dealer controller
const assignCompaniesToDealer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await DealerServices.assignCompaniesToDealerIntoDB(
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Companies have been assigned to dealer successfully',
        data: result,
    });
});

// get dealer dashboard data controller
const getDealerDashboardData = catchAsync(async (req, res) => {
    const { id, startDate, endDate } = req.query;
    const result = await DealerServices.getDealerDashboardDataFromDB(
        id as string,
        startDate as string,
        endDate as string
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Dealer Dashboard data has been retrieved successfully',
        data: result,
    });
});

export const DealerControllers = {
    getAllDealer,
    getAllDealerByUser,
    getAllDealerWithSrAndProduct,
    getSingleDealer,
    getSingleDealerWithSrAndProduct,
    assignCompaniesToDealer,
    getDealerDashboardData,
};
