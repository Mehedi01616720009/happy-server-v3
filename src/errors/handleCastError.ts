import mongoose from 'mongoose';
import { TErrorMessages, TErrorResponse } from '../interfaces/error';
import httpStatus from 'http-status';

const handleCastError = (err: mongoose.Error.CastError): TErrorResponse => {
    const errorMessages: TErrorMessages = [
        {
            path: err.path,
            message: err.message,
        },
    ];
    const statusCode = httpStatus.BAD_REQUEST;
    return {
        statusCode,
        message: 'Invalid ID',
        errorMessages,
    };
};

export default handleCastError;
