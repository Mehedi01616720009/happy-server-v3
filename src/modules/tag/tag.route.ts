import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { TagValidations } from './tag.validation';
import { TagControllers } from './tag.controller';

const router = Router();

// create product route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(TagValidations.createTagValidationSchema),
    TagControllers.createTag
);

// get all product route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    TagControllers.getAllTag
);

// get single product route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    TagControllers.getSingleTag
);

// update product route
router.patch(
    '/:id/update',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(TagValidations.updateTagValidationSchema),
    TagControllers.updateTag
);

export const TagRoutes = router;
