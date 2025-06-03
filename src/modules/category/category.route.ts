import { Router } from 'express';
import auth from '../../middlewares/auth';
import formDataHandler from '../../middlewares/formDataHanlder';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLES } from '../user/user.constant';
import { CategoryController } from './category.controller';
import { CategoryValidations } from './category.validation';

const router = Router();

// create category route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    formDataHandler,
    validateRequest(CategoryValidations.createCategoryValidationSchema),
    CategoryController.createCategory
);

// get all category route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    CategoryController.getAllCategory
);

// get single category route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    CategoryController.getSingleCategory
);

// update category route
router.patch(
    '/:id/update',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(CategoryValidations.updateCategoryValidationSchema),
    CategoryController.updateCategory
);

// update category image route
router.patch(
    '/:id/update-image',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    CategoryController.updateCategoryImage
);

// active or disable category route
router.patch(
    '/:id/change-status',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    validateRequest(CategoryValidations.updateCategoryStatusValidationSchema),
    CategoryController.changeCategoryStatus
);

// delete category route
router.delete(
    '/:id/delete',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    CategoryController.deleteCategory
);

export const CategoryRoutes = router;
