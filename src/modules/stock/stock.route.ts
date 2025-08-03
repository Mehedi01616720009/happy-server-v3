import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import { StockControllers } from './stock.controller';

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

export const StockRoutes = router;
