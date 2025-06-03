import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { AreaControllers } from './area.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AreaValidations } from './area.validation';

const router = Router();

// create area route
router.post(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.freelancer
    ),
    validateRequest(AreaValidations.createAreaValidationSchema),
    AreaControllers.createArea
);

// get all area route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    AreaControllers.getAllArea
);

// get single area route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    AreaControllers.getSingleArea
);

// update area route
router.patch(
    '/:id/update',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(AreaValidations.updateAreaValidationSchema),
    AreaControllers.updateArea
);

export const AreaRoutes = router;
