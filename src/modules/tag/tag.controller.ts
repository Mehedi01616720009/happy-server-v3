import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TagServices } from './tag.service';

// create tag controller
const createTag = catchAsync(async (req, res) => {
    const result = await TagServices.createTagIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Tag has been created successfully',
        data: result,
    });
});

// get all tag controller
const getAllTag = catchAsync(async (req, res) => {
    const result = await TagServices.getAllTagFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Tags have been retrieved successfully',
        data: result,
    });
});

// get single tag controller
const getSingleTag = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await TagServices.getSingleTagFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product has been retrieved successfully',
        data: result,
    });
});

// update tag controller
const updateTag = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await TagServices.updateTagIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product has been updated successfully',
        data: result,
    });
});

export const TagControllers = {
    createTag,
    getAllTag,
    getSingleTag,
    updateTag,
};
