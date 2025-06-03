import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PickedProductServices } from './pickupMan.service';

// create picked product controller
const createPickedProduct = catchAsync(async (req, res) => {
    const result = await PickedProductServices.createPickedProductIntoDB(
        req.body,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product has been picked from dealer successfully',
        data: result,
    });
});

// get all picked product controller
const getAllPickedProduct = catchAsync(async (req, res) => {
    const result = await PickedProductServices.getAllPickedProductFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Picked Products have been retrieved successfully',
        data: result,
    });
});

// get single pickupman controller
const getSinglePickupman = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await PickedProductServices.getSinglePickupmanFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Pickupman has been retrieved successfully',
        data: result,
    });
});

// get single packingman controller
const getSinglePackingman = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await PickedProductServices.getSinglePackingmanFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Pickupman has been retrieved successfully',
        data: result,
    });
});

// assign warehouse to pickupman controller
const assignWarehouseToPickupman = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await PickedProductServices.assignWarehouseToPickupmanIntoDB(
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Pickupman has been assigned successfully',
        data: result,
    });
});

// assign warehouse to packingman controller
const assignWarehouseToPackingman = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result =
        await PickedProductServices.assignWarehouseToPackingmanIntoDB(
            id,
            req.body
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Packingman has been assigned successfully',
        data: result,
    });
});

// update picked product controller
const updatePickedProduct = catchAsync(async (req, res) => {
    const { id, warehouseID } = req.params;
    const result = await PickedProductServices.updatePickedProductIntoDB(
        id,
        warehouseID,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Picked Product has been updated successfully',
        data: result,
    });
});

export const PickedProductControllers = {
    createPickedProduct,
    getAllPickedProduct,
    getSinglePickupman,
    getSinglePackingman,
    assignWarehouseToPickupman,
    assignWarehouseToPackingman,
    updatePickedProduct,
};
