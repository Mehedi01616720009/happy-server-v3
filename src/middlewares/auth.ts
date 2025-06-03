import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';

const auth = (...requiredRole: TUserRole[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const bearerToken = req.headers.authorization;

            // take only token from 'Bearer token'
            const accessToken = bearerToken?.split(' ')[1];
            if (!accessToken) {
                throw new AppError(
                    httpStatus.UNAUTHORIZED,
                    'You are not authorized'
                );
            }

            // token verify
            jwt.verify(
                accessToken,
                config.accessSecret as string,
                function (err, decoded) {
                    if (err) {
                        throw new AppError(
                            httpStatus.UNAUTHORIZED,
                            'You are not authorized'
                        );
                    }

                    const decodedRole = (decoded as JwtPayload).role;

                    if (requiredRole && !requiredRole.includes(decodedRole)) {
                        throw new AppError(
                            httpStatus.UNAUTHORIZED,
                            'You are not authorized'
                        );
                    }

                    // set user in request
                    req.user = decoded as JwtPayload;
                    next();
                }
            );
        }
    );
};

export default auth;
