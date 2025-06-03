import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UnionServices } from './union.service';

// get all union controller
const getAllUnion = catchAsync(async (req, res) => {
    const result = await UnionServices.getAllUnionFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All unions have been retrieved successfully',
        data: result,
    });
});

// get single union controller
const getSingleUnion = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UnionServices.getSingleUnionFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Union has been retrieved successfully',
        data: result,
    });
});

export const UnionControllers = {
    getAllUnion,
    getSingleUnion,
};
