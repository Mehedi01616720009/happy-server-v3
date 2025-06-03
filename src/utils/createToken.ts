import jwt from 'jsonwebtoken';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

const createToken = (
    payload: {
        userId: string;
        role: string;
    },
    secret: string,
    expiresIn: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secret, { expiresIn }, function (err, token) {
            if (err) {
                reject(
                    new AppError(
                        httpStatus.INTERNAL_SERVER_ERROR,
                        'Something went wrong'
                    )
                );
            } else {
                resolve(token as string);
            }
        });
    });
};

export default createToken;
