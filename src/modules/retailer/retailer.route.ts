import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { RetailerValidations } from './retailer.validation';
import { RetailerControllers } from './retailer.controller';

const router = Router();

// create retailer route
router.post(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    validateRequest(RetailerValidations.createRetailerValidationSchema),
    RetailerControllers.createRetailer
);

// get all retailer route
router.get(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.freelancer),
    RetailerControllers.getAllRetailer
);

// get retailers near me route
router.get(
    '/near-me',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    RetailerControllers.getRetailersNearMe
);

// get all retailer by area route
router.get(
    '/by-area',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.freelancer,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan
    ),
    RetailerControllers.getAllRetailerByArea
);

// get all retailer by area optimize route
router.get(
    '/by-area-optimize',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.freelancer,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan
    ),
    RetailerControllers.getAllRetailerByAreaOptimize
);

// get all retailer for deliveryman route
router.get(
    '/deliveryman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    RetailerControllers.getAllRetailerForDeliveryman
);

// get all retailer for deliveryman route
router.get(
    '/:id/deliveryman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    RetailerControllers.getSingleRetailerForDeliveryman
);

// get pending retailer for deliveryman route
router.get(
    '/invoices',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    RetailerControllers.getInvoicesRetailerForDeliveryman
);

// get pending retailer for deliveryman route
router.get(
    '/deliveryman/:date/pending',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    RetailerControllers.getPendingRetailerForDeliveryman
);

// get baki retailer for deliveryman route
router.get(
    '/deliveryman/:date/baki',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    RetailerControllers.getBakiRetailerForDeliveryman
);

// get all retailer for packingman route
router.get(
    '/packingman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.packingMan),
    RetailerControllers.getAllRetailerForPackingman
);

// get single retailer route
router.get(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.sr),
    RetailerControllers.getSingleRetailer
);

// update retailer route
router.put(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.freelancer,
        USER_ROLES.deliveryMan
    ),
    validateRequest(RetailerValidations.updateRetailerValidationSchema),
    RetailerControllers.updateRetailer
);

export const RetailerRoutes = router;
