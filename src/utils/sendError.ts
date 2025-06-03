import { Response } from 'express';
import { TErrorResponse } from '../interfaces/error';

const sendError = (
    res: Response,
    data: TErrorResponse & { stack: string | null }
) => {
    const response: Partial<TErrorResponse> & {
        success: false;
        stack: string | null;
    } = {
        success: false,
        message: data.message,
        errorMessages: data.errorMessages,
        stack: data?.stack,
    };

    res.status(data.statusCode).json(response);
};

export default sendError;
