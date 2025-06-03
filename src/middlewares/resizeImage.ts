import { NextFunction, Request, Response } from 'express';
import path from 'path';
import sharp from 'sharp';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

const resizeImage = async (req: Request, res: Response, next: NextFunction) => {
    const { filename: image } = req.file as Express.Multer.File;
    const outputPath = path.resolve(
        (req?.file as Express.Multer.File).destination,
        `resized-${image}`
    );

    await sharp((req?.file as Express.Multer.File).path)
        .resize(400, 400)
        .jpeg({ quality: 50 })
        .toFile(outputPath)
        .catch(err => {
            throw new AppError(httpStatus.BAD_REQUEST, err?.message);
        });
    next();
};

export default resizeImage;
