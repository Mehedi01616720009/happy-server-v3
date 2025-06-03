import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DamageServices } from './damage.service';

// create damage controller
const createDamage = catchAsync(async (req, res) => {
    const result = await DamageServices.createDamageIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Damage has been created successfully',
        data: result,
    });
});

// get all damage controller
const getAllDamage = catchAsync(async (req, res) => {
    const result = await DamageServices.getAllDamageFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Damages have been retrieved successfully',
        data: result,
    });
});

export const DamageControllers = {
    createDamage,
    getAllDamage,
};
