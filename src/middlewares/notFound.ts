import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../utils/sendResponse';

const notFound = (req: Request, res: Response, next: NextFunction) => {
    return sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'API Not Found',
        data: null,
    });
};

export default notFound;
