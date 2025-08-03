import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { StockServices } from './stock.service';
import sendResponse from '../../utils/sendResponse';

// get all product stock controller
const getAllProductStock = catchAsync(async (req, res) => {
    const { warehouseID } = req.params;
    const result = await StockServices.getAllProductStockFromDB(
        warehouseID,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Stock has been retrieved successfully',
        data: result,
    });
});

// get product stock history controller
const getProductStockHistory = catchAsync(async (req, res) => {
    const { warehouseID, productID } = req.params;
    const result = await StockServices.getProductStockHistoryFromDB(
        warehouseID,
        productID,
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Stock history has been retrieved successfully',
        data: result,
    });
});

export const StockControllers = {
    getAllProductStock,
    getProductStockHistory,
};
