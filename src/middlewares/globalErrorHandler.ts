import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { TErrorMessages } from '../interfaces/error';
import { ZodError } from 'zod';
import handleZodError from '../errors/handleZodError';
import handleValidationError from '../errors/handleValidationError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import AppError from '../errors/AppError';
import config from '../config';
import sendError from '../utils/sendError';

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR as number;
    let message = 'Something went wrong';

    let errorMessages: TErrorMessages = [
        {
            path: '',
            message: 'Something went wrong',
        },
    ];

    // handle zod, mongoose (validation, cast, 11000 - duplicate error), AppError and Error
    if (err instanceof ZodError) {
        const simplifiedError = handleZodError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorMessages = simplifiedError?.errorMessages;
    } else if (err?.name === 'ValidationError') {
        const simplifiedError = handleValidationError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorMessages = simplifiedError?.errorMessages;
    } else if (err?.name === 'CastError') {
        const simplifiedError = handleCastError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorMessages = simplifiedError?.errorMessages;
    } else if (err?.code === 11000) {
        const simplifiedError = handleDuplicateError(err);
        statusCode = simplifiedError?.statusCode;
        message = simplifiedError?.message;
        errorMessages = simplifiedError?.errorMessages;
    } else if (err instanceof AppError) {
        statusCode = err?.statusCode;
        message = err?.message;
        errorMessages = [
            {
                path: '',
                message: err?.message,
            },
        ];
    } else if (err instanceof Error) {
        message = err?.message;
        errorMessages = [
            {
                path: '',
                message: err?.message,
            },
        ];
    }

    return sendError(res, {
        statusCode,
        message,
        errorMessages,
        stack: config.nodeEnv === 'development' ? err?.stack : null,
    });
};

export default globalErrorHandler;
