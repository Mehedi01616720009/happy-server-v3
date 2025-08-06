import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { StockControllers } from './stock.controller';
import validateRequest from '../../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

// get all product stock route
router.get(
    '/:warehouseID',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.dealer),
    StockControllers.getAllProductStock
);

// get product stock history route
router.get(
    '/:warehouseID/:productID',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.dealer),
    StockControllers.getProductStockHistory
);

// update product stock route
router.patch(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.dealer),
    validateRequest(
        z.object({
            body: z.object({
                quantity: z.number({ required_error: 'Quantity is required' }),
            }),
        })
    ),
    StockControllers.updateProductStock
);

export const StockRoutes = router;
