import { Router } from 'express';
import { USER_ROLES } from '../modules/user/user.constant';
import auth from '../middlewares/auth';
import { DsrControllers } from '../modules/dsr/dsr.controller';
import { ProductControllers } from '../modules/product/product.controller';
import validateRequest from '../middlewares/validateRequest';
import { InventoryValidations } from '../modules/inventory/inventory.validation';
import { InventoryControllers } from '../modules/inventory/inventory.controller';
import { OrderValidations } from '../modules/order/order.validation';
import { OrderController } from '../modules/order/order.controller';

const router = Router();

const packingManCredentials = {
    phone: '09876543213',
    password: '12345678',
};

const baseURL = 'https://sandbox.v3.happybangladesh.com/api/v3';

// get all dsr route
router.get(
    '/dsr',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.packingMan),
    DsrControllers.getAllDsr
);

// get products group by sr and status dispatched route
router.get(
    '/products/group-by-sr-status-dispatched',
    auth(USER_ROLES.packingMan),
    ProductControllers.getProductsGroupedBySRsAndStatusDispatched
);

// create inventory route
// body: {
//      packingman: packingman.packingman.id,
//      dsr: dsr.dsr.id,
//      warehouse: warehouse.id,
//      product: product.id,
//      outQuantity: number,
// }
router.post(
    '/inventories',
    auth(USER_ROLES.packingMan),
    validateRequest(InventoryValidations.inventoryValidationSchema),
    InventoryControllers.createInventory
);

// dispatch order route
// query: ?sr[]=_id&status=Processing&createdAt[gte]=2024-01-01&createdAt[lte]=2024-12-31
// body: { dsr: dsr.dsr.id }
router.patch(
    '/orders/dispatch-order',
    auth(USER_ROLES.packingMan),
    validateRequest(OrderValidations.dispatchOrderValidationSchema),
    OrderController.dispatchOrder
);
