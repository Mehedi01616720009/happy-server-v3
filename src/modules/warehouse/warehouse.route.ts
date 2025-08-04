import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { WarehouseValidations } from './warehouse.validation';
import { WarehouseControllers } from './warehouse.controller';

const router = Router();

// create Warehouse route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(WarehouseValidations.createWarehouseValidationSchema),
    WarehouseControllers.createWarehouse
);

// get all Warehouse route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.pickupMan,
        USER_ROLES.deliveryMan
    ),
    WarehouseControllers.getAllWarehouse
);

// get single Warehouse route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.pickupMan
    ),
    WarehouseControllers.getSingleWarehouse
);

// update Warehouse route
router.patch(
    '/:id/update',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.pickupMan),
    WarehouseControllers.updateWarehouse
);

// delete Warehouse route
router.delete(
    '/:id/delete',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    WarehouseControllers.deleteWarehouse
);

export const WarehouseRoutes = router;
