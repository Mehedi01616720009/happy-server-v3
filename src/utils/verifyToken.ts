import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

const verifyToken = (token: string, secret: string): Promise<JwtPayload> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                reject(
                    new AppError(
                        httpStatus.UNAUTHORIZED,
                        'You are not authorized'
                    )
                );
            } else {
                resolve(decoded as JwtPayload);
            }
        });
    });
};

export default verifyToken;
