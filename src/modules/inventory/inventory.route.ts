import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../user/user.constant';
import { InventoryControllers } from './inventory.controller';
import { InventoryValidations } from './inventory.validation';

const router = Router();

// create inventory route
router.post(
    '/',
    auth(USER_ROLES.packingMan),
    validateRequest(InventoryValidations.inventoryValidationSchema),
    InventoryControllers.createInventory
);

// create inventory route
router.post(
    '/',
    auth(USER_ROLES.packingMan),
    validateRequest(InventoryValidations.inventoryValidationSchema),
    InventoryControllers.createAltInventory
);

export const InventoryRoutes = router;
