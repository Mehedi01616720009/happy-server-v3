import { Router } from 'express';
import { USER_ROLES } from '../user/user.constant';
import auth from '../../middlewares/auth';
import { UpazilaControllers } from './upazila.controller';

const router = Router();

// get all upazila route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    UpazilaControllers.getAllUpazila
);

// get single upazila route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan,
        USER_ROLES.freelancer
    ),
    UpazilaControllers.getSingleUpazila
);

export const UpazilaRoutes = router;
