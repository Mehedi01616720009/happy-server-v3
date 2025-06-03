import { Router } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLES } from '../user/user.constant';
import { MediaControllers } from './media.controller';

const router = Router();

// upload media route
router.post(
    '/upload',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.freelancer
    ),
    upload.single('file'),
    MediaControllers.uploadMedia
);

export const MediaRoutes = router;
