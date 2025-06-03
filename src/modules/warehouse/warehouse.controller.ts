import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WarehouseServices } from './warehouse.service';

// create warehouse controller
const createWarehouse = catchAsync(async (req, res) => {
    const result = await WarehouseServices.createWarehouseIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Warehouse has been created successfully',
        data: result,
    });
});

// get all Warehouse controller
const getAllWarehouse = catchAsync(async (req, res) => {
    const result = await WarehouseServices.getAllWarehouseFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All warehouses have been retrieved successfully',
        data: result,
    });
});

// get single Warehouse controller
const getSingleWarehouse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WarehouseServices.getSingleWarehouseFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Warehouse has been retrieved successfully',
        data: result,
    });
});

// update Warehouse controller
const updateWarehouse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WarehouseServices.updateWarehouseIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Warehouse has been updated successfully',
        data: result,
    });
});

// delete Warehouse controller
const deleteWarehouse = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await WarehouseServices.deleteWarehouseFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Warehouse has been deleted successfully',
        data: result,
    });
});

export const WarehouseControllers = {
    createWarehouse,
    getAllWarehouse,
    getSingleWarehouse,
    updateWarehouse,
    deleteWarehouse,
};
