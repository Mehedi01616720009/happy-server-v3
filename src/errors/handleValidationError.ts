import mongoose from 'mongoose';
import { TErrorMessages, TErrorResponse } from '../interfaces/error';
import httpStatus from 'http-status';

const handleValidationError = (
    err: mongoose.Error.ValidationError
): TErrorResponse => {
    const errorMessages: TErrorMessages = Object.values(err.errors).map(
        (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
            return {
                path: val?.path,
                message: val?.message,
            };
        }
    );
    const statusCode = httpStatus.BAD_REQUEST;
    return {
        statusCode,
        message: 'Validation error',
        errorMessages,
    };
};

export default handleValidationError;
