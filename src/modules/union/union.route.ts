import { Router } from 'express';
import { USER_ROLES } from '../user/user.constant';
import auth from '../../middlewares/auth';
import { UnionControllers } from './union.controller';

const router = Router();

// get all union route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    UnionControllers.getAllUnion
);

// get single union route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    UnionControllers.getSingleUnion
);

export const UnionRoutes = router;
