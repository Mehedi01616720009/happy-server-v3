import { ZodError, ZodIssue } from 'zod';
import httpStatus from 'http-status';
import { TErrorMessages, TErrorResponse } from '../interfaces/error';

const handleZodError = (err: ZodError): TErrorResponse => {
    const errorMessages: TErrorMessages = err.issues.map((issue: ZodIssue) => {
        return {
            path: issue?.path[issue.path.length - 1],
            message: issue.message,
        };
    });
    const statusCode = httpStatus.BAD_REQUEST;
    return {
        statusCode,
        message: err.issues[0].message,
        errorMessages,
    };
};

export default handleZodError;
