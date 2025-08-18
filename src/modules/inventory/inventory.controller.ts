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

export const InventoryControllers = {
    createInventory,
    createAltInventory,
};
