import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { DamageValidations } from './damage.validation';
import { DamageControllers } from './damage.controller';

const router = Router();

// create damage route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.deliveryMan),
    validateRequest(DamageValidations.createDamageValidationSchema),
    DamageControllers.createDamage
);

// get all damage route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    DamageControllers.getAllDamage
);

export const DamageRoutes = router;
