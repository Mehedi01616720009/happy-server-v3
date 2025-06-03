import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CompanyServices } from './company.service';

// create company controller
const createCompany = catchAsync(async (req, res) => {
    const result = await CompanyServices.createCompanyIntoDB(
        req?.file as Express.Multer.File,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Company has been created successfully',
        data: result,
    });
});

// get all company controller
const getAllCompany = catchAsync(async (req, res) => {
    const result = await CompanyServices.getAllCompanyFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Companies have been retrieved successfully',
        data: result,
    });
});

// get single company controller
const getSingleCompany = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CompanyServices.getSingleCompanyFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Company has been retrieved successfully',
        data: result,
    });
});

// update company controller
const updateCompany = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CompanyServices.updateCompanyIntoDB(id, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Company has been updated successfully',
        data: result,
    });
});

// update company image controller
const updateCompanyImage = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CompanyServices.updateCompanyImageIntoDB(
        id,
        req.file as Express.Multer.File
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Company image has been updated successfully',
        data: result,
    });
});

// change company status controller
const changeCompanyStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CompanyServices.changeCompanyStatusIntoDB(
        id,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `Company has been ${result?.status} successfully`,
        data: result,
    });
});

// delete company controller
const deleteCompany = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await CompanyServices.deleteCompanyFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Company has been deleted successfully',
        data: result,
    });
});

export const CompanyController = {
    createCompany,
    getAllCompany,
    getSingleCompany,
    updateCompany,
    updateCompanyImage,
    changeCompanyStatus,
    deleteCompany,
};
