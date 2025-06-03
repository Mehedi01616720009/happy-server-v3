import { Response } from 'express';

interface IResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

const sendResponse = <T>(res: Response, data: IResponse<T>) => {
    const response: Partial<IResponse<T>> = {
        success: data.success,
        message: data.message,
        data: data.data,
    };

    res.status(data.statusCode).json(response);
};

export default sendResponse;
