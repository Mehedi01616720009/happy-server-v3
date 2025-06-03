import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FreelancerServices } from './freelancer.service';

// get all freelancer controller
const getAllFreelancer = catchAsync(async (req, res) => {
    const result = await FreelancerServices.getAllFreelancerFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Freelancers have been retrieved successfully',
        data: result,
    });
});

// get single freelancer controller
const getSingleFreelancer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await FreelancerServices.getSingleFreelancerFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Freelancer has been retrieved successfully',
        data: result,
    });
});

// get freelancer overview controller
const getFreelancerOverview = catchAsync(async (req, res) => {
    const { id } = req.params;
    const date = req.query?.date;
    const result = await FreelancerServices.getFreelancerOverviewFromDB(
        id,
        date ? (date as string) : null
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Freelancer overview has been retrieved successfully',
        data: result,
    });
});

// assign upazilas to freelancer controller
const assignUpazilasToFreelancer = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await FreelancerServices.assignUpazilasToFreelancerIntoDB(
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Upazilas have been assigned to freelancer successfully',
        data: result,
    });
});

// update freelancer work controller
const updateFreelancerWork = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await FreelancerServices.updateFreelancerWorkIntoDB(
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Freelancer work data has been updated successfully',
        data: result,
    });
});

export const FreelancerControllers = {
    getAllFreelancer,
    getSingleFreelancer,
    getFreelancerOverview,
    assignUpazilasToFreelancer,
    updateFreelancerWork,
};
