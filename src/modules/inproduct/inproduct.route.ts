import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { InProductValidations } from './inproduct.validation';
import { InProductControllers } from './inproduct.controller';

const router = Router();

// create in product route
router.post(
    '/',
    auth(USER_ROLES.deliveryMan),
    validateRequest(InProductValidations.createInProductValidationSchema),
    InProductControllers.createInProduct
);

// get all in product route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.deliveryMan,
        USER_ROLES.packingMan
    ),
    InProductControllers.getAllInProduct
);

// get single in product route
router.get(
    '/:dsrId/:productId',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    InProductControllers.getSingleInProduct
);

export const InProductRoutes = router;
