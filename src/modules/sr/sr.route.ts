import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { SrValidations } from './sr.validation';
import { SrControllers } from './sr.controller';

const router = Router();

// get all sr route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.pickupMan,
        USER_ROLES.deliveryMan
    ),
    SrControllers.getAllSr
);

// get single sr route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.pickupMan,
        USER_ROLES.deliveryMan
    ),
    SrControllers.getSingleSr
);

// get sr overview for dealer route
router.get(
    '/:id/overview',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr
    ),
    SrControllers.getSrOverview
);

// update sr info route
router.put(
    '/:id/update-info',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(SrValidations.updateSrInfoValidationSchema),
    SrControllers.updateSrInfo
);

// get sr dashboard data route
router.get(
    '/dashboard/data',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.sr),
    SrControllers.getSrDashboardData
);

// get sr dashboard data route
router.get(
    '/:id/home/data',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.sr),
    SrControllers.getSrHomeData
);

export const SrRoutes = router;
