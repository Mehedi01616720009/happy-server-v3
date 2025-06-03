import { Router } from 'express';
import { USER_ROLES } from '../user/user.constant';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FreelancerValidations } from './freelancer.validation';
import { FreelancerControllers } from './freelancer.controller';

const router = Router();

// get all freelancer route
router.get(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    FreelancerControllers.getAllFreelancer
);

// get single freelancer route
router.get(
    '/:id',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    FreelancerControllers.getSingleFreelancer
);

// get freelancer overview route
router.get(
    '/:id/overview',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    FreelancerControllers.getFreelancerOverview
);

// assign upazilas to freelancer route
router.put(
    '/:id/assign-upazilas',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(
        FreelancerValidations.assignUpazilasToFreelancerValidationSchema
    ),
    FreelancerControllers.assignUpazilasToFreelancer
);

// update freelancer work route
router.put(
    '/:id/update-work',
    auth(USER_ROLES.freelancer),
    validateRequest(FreelancerValidations.updateFreelancerWorkValidationSchema),
    FreelancerControllers.updateFreelancerWork
);

export const FreelancerRoutes = router;
