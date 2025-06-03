import httpStatus from 'http-status';
import { TErrorMessages, TErrorResponse } from '../interfaces/error';

const handleDuplicateError = (err: any): TErrorResponse => {
    const match = err.message.match(/"([^"]*)"/);
    const extractMessage = match && match[1];
    const errorMessages: TErrorMessages = [
        {
            path: '',
            message: `${extractMessage} is already exist`,
        },
    ];
    const statusCode = httpStatus.BAD_REQUEST;
    return {
        statusCode,
        message: `${extractMessage} is already exist`,
        errorMessages,
    };
};

export default handleDuplicateError;
