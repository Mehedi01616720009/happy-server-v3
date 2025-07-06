import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PickupManValidations } from './pickupMan.validation';
import { PickedProductControllers } from './pickupMan.controller';

const router = Router();

// create picked product route
router.post(
    '/pick-product',
    auth(USER_ROLES.pickupMan),
    validateRequest(PickupManValidations.createPickedProductValidationSchema),
    PickedProductControllers.createPickedProduct
);

// get all picked product route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.pickupMan
    ),
    PickedProductControllers.getAllPickedProduct
);

// get single pickupman route
router.get(
    '/:id/pickupman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.pickupMan),
    PickedProductControllers.getSinglePickupman
);

// get single packingman route
router.get(
    '/:id/packingman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.packingMan),
    PickedProductControllers.getSinglePackingman
);

// assign warehouse to pickupman route
router.patch(
    '/:id/assign-warehouse/pickupman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(PickupManValidations.assignWarehouseValidationSchema),
    PickedProductControllers.assignWarehouseToPickupman
);

// assign warehouse to packingman route
router.patch(
    '/:id/assign-warehouse/packingman',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(PickupManValidations.assignWarehouseValidationSchema),
    PickedProductControllers.assignWarehouseToPackingman
);

// update picked product route
router.patch(
    '/:id/update/:warehouseID',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(PickupManValidations.updatePickedProductValidationSchema),
    PickedProductControllers.updatePickedProduct
);

export const PickedProductRoutes = router;
