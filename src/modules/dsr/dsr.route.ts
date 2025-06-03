import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { DsrControllers } from './dsr.controller';
import { DsrValidations } from './dsr.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = Router();

// get all dsr route
router.get(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    DsrControllers.getAllDsr
);

// get single dsr route
router.get(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    DsrControllers.getSingleDsr
);

// assign upazilas to dsr route
router.put(
    '/:id/assign-upazilas',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(DsrValidations.assignUpazilasToDsrValidationSchema),
    DsrControllers.assignUpazilasToDsr
);

// get dsr widget data route
router.get(
    '/:id/widget',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    DsrControllers.getDsrWidgetData
);

export const DsrRoutes = router;
