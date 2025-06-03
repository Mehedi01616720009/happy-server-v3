import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UpazilaServices } from './upazila.service';

// get all upazila controller
const getAllUpazila = catchAsync(async (req, res) => {
    const result = await UpazilaServices.getAllUpazilaFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All upazilas have been retrieved successfully',
        data: result,
    });
});

// get single upazila controller
const getSingleUpazila = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await UpazilaServices.getSingleUpazilaFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Upazila has been retrieved successfully',
        data: result,
    });
});

export const UpazilaControllers = {
    getAllUpazila,
    getSingleUpazila,
};
