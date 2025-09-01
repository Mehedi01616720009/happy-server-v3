import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { OrderValidations } from './order.validation';
import { OrderController } from './order.controller';

const router = Router();

// create order route
router.post(
    '/',
    auth(USER_ROLES.sr, USER_ROLES.deliveryMan),
    validateRequest(OrderValidations.createOrderValidationSchema),
    OrderController.createOrder
);

// create ready order route
router.post(
    '/ready-sell',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    validateRequest(OrderValidations.createOrderValidationSchema),
    OrderController.createOrder
);

// get all order route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan
    ),
    OrderController.getAllOrder
);

// get single order route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.packingMan
    ),
    OrderController.getSingleOrder
);

// update order product route
router.patch(
    '/:id/product/:productId/update-product',
    auth(USER_ROLES.packingMan),
    validateRequest(OrderValidations.updateOrderProductValidationSchema),
    OrderController.updateOrderProduct
);

// dispatch order route
router.patch(
    '/dispatch-order', // ?sr[]=_id&status=Processing&createdAt[gte]=2024-01-01&createdAt[lte]=2024-12-31 + payload: { dsr: string }
    auth(USER_ROLES.packingMan),
    validateRequest(OrderValidations.dispatchOrderValidationSchema),
    OrderController.dispatchOrder
);

// cancel order route
router.patch(
    '/:id/cancel-order',
    auth(USER_ROLES.sr, USER_ROLES.deliveryMan),
    validateRequest(OrderValidations.cancelOrderValidationSchema),
    OrderController.cancelOrder
);

// update order product route
router.patch(
    '/:id/product/:productId/update-product-by-sr',
    auth(USER_ROLES.sr),
    validateRequest(OrderValidations.updateOrderProductValidationSchema),
    OrderController.updateOrderProductBySr
);

// deliver order route
router.patch(
    '/:id/deliver-order',
    auth(USER_ROLES.deliveryMan),
    validateRequest(OrderValidations.deliverOrderValidationSchema),
    OrderController.deliverOrder
);

// update baki order route
router.patch(
    '/:id/baki-order',
    auth(USER_ROLES.deliveryMan),
    validateRequest(OrderValidations.bakiOrderValidationSchema),
    OrderController.updateBakiOrder
);

// get order summary route
router.get(
    '/summary/details',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr
    ),
    OrderController.getOrderSummary
);

// get order history route
router.get(
    '/history/details',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr
    ),
    OrderController.getOrderHistory
);

// get order history route
router.get(
    '/order/counting',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.packingMan
    ),
    OrderController.getOrderCounting
);

// delete order route
router.delete(
    '/delete-many',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(OrderValidations.deleteOrderValidationSchema),
    OrderController.deleteManyOrder
);

// delete order route
router.delete(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.sr),
    OrderController.deleteOrder
);

export const OrderRoutes = router;
