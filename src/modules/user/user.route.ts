import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from './user.constant';
import { upload } from '../../utils/sendImageToCloudinary';
import formDataHandler from '../../middlewares/formDataHanlder';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';
import { UserControllers } from './user.controller';

const router = Router();

// create user route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    formDataHandler,
    validateRequest(UserValidations.createUserValidationSchema),
    UserControllers.createUser
);

// get all user route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan
    ),
    UserControllers.getAllUser
);

// get single user route
router.get(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    UserControllers.getSingleUser
);

// change password route
router.patch(
    '/:id/change-password',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.pickupMan,
        USER_ROLES.checkingMan,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan,
        USER_ROLES.customerCare,
        USER_ROLES.retailer,
        USER_ROLES.freelancer
    ),
    validateRequest(UserValidations.changePasswordValidationSchema),
    UserControllers.changePassword
);

// update user image route
router.patch(
    '/:id/update-image',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.pickupMan,
        USER_ROLES.checkingMan,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan,
        USER_ROLES.customerCare,
        USER_ROLES.retailer,
        USER_ROLES.freelancer
    ),
    upload.single('file'),
    UserControllers.updateUserImage
);

// active or block user route
router.patch(
    '/:id/change-status',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(UserValidations.updateUserStatusValidationSchema),
    UserControllers.changeUserStatus
);

// delete user route
router.delete(
    '/:id/delete',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    UserControllers.deleteUser
);

export const UserRoutes = router;
