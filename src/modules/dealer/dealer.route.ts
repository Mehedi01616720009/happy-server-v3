import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../user/user.constant';
import { DealerControllers } from './dealer.controller';
import { DealerValidations } from './dealer.validation';

const router = Router();

// get all dealer route
router.get(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    DealerControllers.getAllDealer
);

// get all dealer route
router.get(
    '/by-user',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.checkingMan),
    DealerControllers.getAllDealerByUser
);

// get all dealer with sr and product route
router.get(
    '/sr-product-count',
    auth(USER_ROLES.pickupMan),
    DealerControllers.getAllDealerWithSrAndProduct
);

// get single dealer route
router.get(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    DealerControllers.getSingleDealer
);

// get single dealer with sr and product route
router.get(
    '/:id/sr-product-count',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    DealerControllers.getSingleDealerWithSrAndProduct
);

// assign companies to dealer route
router.put(
    '/:id/assign-companies',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(DealerValidations.assignCompaniesToDealerValidationSchema),
    DealerControllers.assignCompaniesToDealer
);

// get dealer dashboard data route
router.get(
    '/dashboard/data',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.dealer),
    DealerControllers.getDealerDashboardData
);

export const DealerRoutes = router;
