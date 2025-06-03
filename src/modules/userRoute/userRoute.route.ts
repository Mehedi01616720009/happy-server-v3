import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { UserRouteValidations } from './userRoute.validation';
import { UserRouteControllers } from './userRoute.controller';

const router = Router();

// create user route - route
router.put(
    '/:id/create-route',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(UserRouteValidations.createUserRouteValidationSchema),
    UserRouteControllers.createUserRoute
);

// get user route - route
router.get(
    '/:id/user-route',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.packingMan
    ),
    UserRouteControllers.getSingleUserRoute
);

// create sr route day - route
router.put(
    '/:id/create-sr-day',
    auth(USER_ROLES.sr),
    validateRequest(UserRouteValidations.createSrRouteDayValidationSchema),
    UserRouteControllers.createSrRouteDay
);

// get sr route day - route
router.get(
    '/:id/sr-day/:date',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.sr),
    UserRouteControllers.getSingleSrRouteDay
);

// delete user route - route
router.patch(
    '/:id/delete-route',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(UserRouteValidations.deleteUserRouteValidationSchema),
    UserRouteControllers.deleteUserRoute
);

export const UserRouteRoutes = router;
