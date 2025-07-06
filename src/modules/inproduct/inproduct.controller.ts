import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { InProductServices } from './inproduct.service';

// create in product controller
const createInProduct = catchAsync(async (req, res) => {
    const result = await InProductServices.createInProductIntoDB(
        req.body,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product has been in from dsr successfully',
        data: result,
    });
});

// get all in product controller
const getAllInProduct = catchAsync(async (req, res) => {
    const result = await InProductServices.getAllInProductFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All in products have been retrieved successfully',
        data: result,
    });
});

// get single in product controller
const getSingleInProduct = catchAsync(async (req, res) => {
    const { dsrId, productId } = req.params;
    const result = await InProductServices.getSingleInProductFromDB(
        dsrId,
        productId
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'In product has been retrieved successfully',
        data: result,
    });
});

export const InProductControllers = {
    createInProduct,
    getAllInProduct,
    getSingleInProduct,
};
