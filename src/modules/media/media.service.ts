import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

// upload media
const uploadMediaIntoCloudinary = async (file: Express.Multer.File) => {
    if (file?.path) {
        // generate image name
        const imageName = String(Date.now());

        // wait for cloudinary response
        const image = await sendImageToCloudinary(imageName, file?.path);
        return { profileImg: image };
    }

    return { profileImg: null };
};

export const MediaServices = {
    uploadMediaIntoCloudinary,
};
