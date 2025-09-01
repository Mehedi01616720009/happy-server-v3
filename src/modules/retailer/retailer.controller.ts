import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RetailerServices } from './retailer.service';

// create retailer controller
const createRetailer = catchAsync(async (req, res) => {
    const result = await RetailerServices.createRetailerIntoDB(
        req.body,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Retailer has been created successfully',
        data: result,
    });
});

// get all retailer controller
const getAllRetailer = catchAsync(async (req, res) => {
    const result = await RetailerServices.getAllRetailerFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get retailers near me controller
const getRetailersNearMe = catchAsync(async (req, res) => {
    const result = await RetailerServices.getRetailersNearMeFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get all retailer by area controller
const getAllRetailerByArea = catchAsync(async (req, res) => {
    const result = await RetailerServices.getAllRetailerByAreaFromDB(
        req.query,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get all retailer by area optimize controller
const getAllRetailerByAreaOptimize = catchAsync(async (req, res) => {
    const result = await RetailerServices.getAllRetailerByAreaOptimizeFromDB(
        req.query,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get all retailer for deliveryman controller
const getAllRetailerForDeliveryman = catchAsync(async (req, res) => {
    const result = await RetailerServices.getAllRetailerForDeliverymanFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get single retailer for deliveryman controller
const getSingleRetailerForDeliveryman = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await RetailerServices.getSingleRetailerForDeliverymanFromDB(
        id,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Retailer has been retrieved successfully',
        data: result,
    });
});

// get invoices retailer for deliveryman controller
const getInvoicesRetailerForDeliveryman = catchAsync(async (req, res) => {
    const result =
        await RetailerServices.getInvoicesRetailerForDeliverymanFromDB(
            req.query
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get Pending retailer for deliveryman controller
const getPendingRetailerForDeliveryman = catchAsync(async (req, res) => {
    const { date } = req.params;
    const result =
        await RetailerServices.getPendingRetailerForDeliverymanFromDB(
            date,
            req.query
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get baki retailer for deliveryman controller
const getBakiRetailerForDeliveryman = catchAsync(async (req, res) => {
    const { date } = req.params;
    const result = await RetailerServices.getBakiRetailerForDeliverymanFromDB(
        date,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get all retailer for packingman controller
const getAllRetailerForPackingman = catchAsync(async (req, res) => {
    const result = await RetailerServices.getAllRetailerForPackingmanFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Retailers have been retrieved successfully',
        data: result,
    });
});

// get single retailer controller
const getSingleRetailer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await RetailerServices.getSingleRetailerFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Retailer has been retrieved successfully',
        data: result,
    });
});

// update retailer controller
const updateRetailer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await RetailerServices.updateRetailerIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Retailer has been updated successfully',
        data: result,
    });
});

export const RetailerControllers = {
    createRetailer,
    getAllRetailer,
    getRetailersNearMe,
    getAllRetailerByArea,
    getAllRetailerByAreaOptimize,
    getAllRetailerForDeliveryman,
    getSingleRetailerForDeliveryman,
    getInvoicesRetailerForDeliveryman,
    getPendingRetailerForDeliveryman,
    getBakiRetailerForDeliveryman,
    getAllRetailerForPackingman,
    getSingleRetailer,
    updateRetailer,
};
