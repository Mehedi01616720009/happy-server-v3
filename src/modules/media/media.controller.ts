import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MediaServices } from './media.service';

// upload media controller
const uploadMedia = catchAsync(async (req, res) => {
    const result = await MediaServices.uploadMediaIntoCloudinary(
        req?.file as Express.Multer.File
    );
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Image has been uploaded successfully',
        data: result,
    });
});

export const MediaControllers = {
    uploadMedia,
};
