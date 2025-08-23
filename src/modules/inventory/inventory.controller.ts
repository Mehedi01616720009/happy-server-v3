import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InventoryServices } from './inventory.service';

// create inventory controller
const createInventory = catchAsync(async (req, res) => {
    const result = await InventoryServices.createInventoryIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product has been added to inventory successfully',
        data: result,
    });
});

// create alt inventory controller
const createAltInventory = catchAsync(async (req, res) => {
    const result = await InventoryServices.createAltInventoryIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product has been added to inventory successfully',
        data: result,
    });
});

// get all inventories controller
const getAllInventories = catchAsync(async (req, res) => {
    const result = await InventoryServices.getAllInventoriesFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Inventory has been retrieved successfully',
        data: result,
    });
});

export const InventoryControllers = {
    createInventory,
    createAltInventory,
    getAllInventories,
};
