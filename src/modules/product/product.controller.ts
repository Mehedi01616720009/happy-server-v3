import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProductServices } from './product.service';

// create product controller
const createProduct = catchAsync(async (req, res) => {
    const result = await ProductServices.createProductIntoDB(
        req?.file as Express.Multer.File,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Product has been created successfully',
        data: result,
    });
});

// get all product controller
const getAllProduct = catchAsync(async (req, res) => {
    const result = await ProductServices.getAllProductFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Products have been retrieved successfully',
        data: result,
    });
});

// get top selling product controller
const getTopSellingProduct = catchAsync(async (req, res) => {
    const result = await ProductServices.getTopSellingProductFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Top Selling Products have been retrieved successfully',
        data: result,
    });
});

// get all product with stock controller
const getAllProductWithStock = catchAsync(async (req, res) => {
    const result = await ProductServices.getAllProductWithStockFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Products have been retrieved successfully',
        data: result,
    });
});

// get products group by sr and ordered date controller
const getProductsGroupedBySRsAndOrderedDate = catchAsync(async (req, res) => {
    const result =
        await ProductServices.getProductsGroupedBySRsAndOrderedDateFromDB(
            req.query.sr as string | string[],
            req.user,
            req.query?.createdAt as string
        );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Products have been retrieved successfully',
        data: result,
    });
});

// get products group by sr and status dispatched controller
const getProductsGroupedBySRsAndStatusDispatched = catchAsync(
    async (req, res) => {
        const result =
            await ProductServices.getProductsGroupedBySRsAndStatusDispatchedFromDB(
                req.query,
                req.user
            );
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All Products have been retrieved successfully',
            data: result,
        });
    }
);

// get single product controller
const getSingleProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductServices.getSingleProductFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product has been retrieved successfully',
        data: result,
    });
});

// update product controller
const updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductServices.updateProductIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product has been updated successfully',
        data: result,
    });
});

// update product image controller
const updateProductImage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductServices.updateProductImageIntoDB(
        id,
        req?.file as Express.Multer.File
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product image has been updated successfully',
        data: result,
    });
});

// delete product controller
const deleteProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await ProductServices.deleteProductIntoDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product has been deleted successfully',
        data: result,
    });
});

export const ProductControllers = {
    createProduct,
    getAllProduct,
    getTopSellingProduct,
    getAllProductWithStock,
    getProductsGroupedBySRsAndOrderedDate,
    getProductsGroupedBySRsAndStatusDispatched,
    getSingleProduct,
    updateProduct,
    updateProductImage,
    deleteProduct,
};
