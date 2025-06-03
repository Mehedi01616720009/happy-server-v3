import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CategoryServices } from './category.service';

// create category controller
const createCategory = catchAsync(async (req, res) => {
    const result = await CategoryServices.createCategoryIntoDB(
        req?.file as Express.Multer.File,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Category has been created successfully',
        data: result,
    });
});

// get all category controller
const getAllCategory = catchAsync(async (req, res) => {
    const result = await CategoryServices.getAllCategoryFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Categories have been retrieved successfully',
        data: result,
    });
});

// get single category controller
const getSingleCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryServices.getSingleCategoryFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category has been retrieved successfully',
        data: result,
    });
});

// update category controller
const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryServices.updateCategoryIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category has been updated successfully',
        data: result,
    });
});

// update category image controller
const updateCategoryImage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryServices.updateCategoryImageIntoDB(
        id,
        req.file as Express.Multer.File
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category image has been updated successfully',
        data: result,
    });
});

// change category status controller
const changeCategoryStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryServices.changeCategoryStatusIntoDB(
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Category has been ${result?.status} successfully`,
        data: result,
    });
});

// delete category controller
const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CategoryServices.deleteCategoryFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category has been deleted successfully',
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategory,
    getSingleCategory,
    updateCategory,
    updateCategoryImage,
    changeCategoryStatus,
    deleteCategory,
};
