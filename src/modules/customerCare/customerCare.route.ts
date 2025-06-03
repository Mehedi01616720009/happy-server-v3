import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { CustomerCareDataValidations } from './customerCare.vaidation';
import { CustomerCareDataControllers } from './customerCare.controller';

const router = Router();

// create customer care data route
router.put(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    validateRequest(
        CustomerCareDataValidations.createCustomerCareDataValidationSchema
    ),
    CustomerCareDataControllers.createCustomerCareData
);

// get all customer care data route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.deliveryMan,
        USER_ROLES.customerCare
    ),
    CustomerCareDataControllers.getAllCustomerCareData
);

// update not reach customer care data route
router.patch(
    '/:id/update/not-reach',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.customerCare),
    CustomerCareDataControllers.updateNotReachCustomerCareData
);

// update not interest customer care data route
router.patch(
    '/:id/update/not-interest',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.customerCare),
    validateRequest(
        CustomerCareDataValidations.updateNotInterestCustomerCareDataValidationSchema
    ),
    CustomerCareDataControllers.updateNotInterestCustomerCareData
);

// update interest customer care data route
router.patch(
    '/:id/update/interest',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.customerCare),
    validateRequest(
        CustomerCareDataValidations.updateInterestCustomerCareDataValidationSchema
    ),
    CustomerCareDataControllers.updateInterestCustomerCareData
);

export const CustomerCareDataRoutes = router;
