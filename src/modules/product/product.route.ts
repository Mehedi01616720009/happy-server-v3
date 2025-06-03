import { Router } from 'express';
import auth from '../../middlewares/auth';
import formDataHandler from '../../middlewares/formDataHanlder';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLES } from '../user/user.constant';
import { ProductControllers } from './product.controller';
import { ProductValidations } from './product.validation';

const router = Router();

// create product route
router.post(
    '/',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    formDataHandler,
    validateRequest(ProductValidations.createProductValidationSchema),
    ProductControllers.createProduct
);

// get all product route
router.get(
    '/',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    ProductControllers.getAllProduct
);

// get all product route
router.get(
    '/with-stock',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.pickupMan,
        USER_ROLES.packingMan,
        USER_ROLES.deliveryMan
    ),
    ProductControllers.getAllProductWithStock
);

// get products group by sr and ordered date route
router.get(
    '/group-by-sr-ordered-date',
    auth(USER_ROLES.sr, USER_ROLES.pickupMan),
    ProductControllers.getProductsGroupedBySRsAndOrderedDate
);

// get single product route
router.get(
    '/:id',
    auth(
        USER_ROLES.superAdmin,
        USER_ROLES.admin,
        USER_ROLES.dealer,
        USER_ROLES.sr,
        USER_ROLES.deliveryMan
    ),
    ProductControllers.getSingleProduct
);

// update product route
router.patch(
    '/:id/update',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin, USER_ROLES.dealer),
    validateRequest(ProductValidations.updateProductValidationSchema),
    ProductControllers.updateProduct
);

// update product image route
router.patch(
    '/:id/update-image',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    upload.single('file'),
    ProductControllers.updateProductImage
);

// update product route
router.delete(
    '/:id/delete',
    auth(USER_ROLES.superAdmin, USER_ROLES.admin),
    ProductControllers.deleteProduct
);

export const ProductRoutes = router;
