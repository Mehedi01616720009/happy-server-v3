import { Router } from 'express';
import auth from '../../middlewares/auth';
import formDataHandler from '../../middlewares/formDataHanlder';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLES } from '../user/user.constant';
import { CompanyController } from './company.controller';
import { CompanyValidations } from './company.validation';

const router = Router();

// create company route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    formDataHandler,
    validateRequest(CompanyValidations.createCompanyValidationSchema),
    CompanyController.createCompany
);

// get all company route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    CompanyController.getAllCompany
);

// get single company route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    CompanyController.getSingleCompany
);

// update company route
router.patch(
    '/:id/update',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(CompanyValidations.updateCompanyValidationSchema),
    CompanyController.updateCompany
);

// update company image route
router.patch(
    '/:id/update-image',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    CompanyController.updateCompanyImage
);

// active or disable company route
router.patch(
    '/:id/change-status',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(CompanyValidations.updateCompanyStatusValidationSchema),
    CompanyController.changeCompanyStatus
);

// delete company route
router.delete(
    '/:id/delete',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    CompanyController.deleteCompany
);

export const CompanyRoutes = router;
