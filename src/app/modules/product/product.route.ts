import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateQuery, validateRequest } from '../../middlewares/validateRequest';
import { productController } from './product.controller';
import { UserRole } from '../user/user.constants';
import { createProductValidationSchema, getProductsQuerySchema, updateProductValidationSchema } from './product.validation';
import { multerUpload } from '../../config/multer.config';

const router = Router();

// Manager: "Manage Products" | Employee: "View Products" | Admin: full access
router.post(
    '/',
    checkAuth(UserRole.ADMIN, UserRole.MANAGER),
     multerUpload.array("files"),
    validateRequest(createProductValidationSchema),
    productController.createProduct,
);

router.get(
    '/',
    checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
    validateQuery(getProductsQuerySchema),
    productController.getAllProducts,
);

router.get(
    '/:id',
    checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
    productController.getSingleProduct,
);

router.patch(
    '/:id',
    checkAuth(UserRole.ADMIN, UserRole.MANAGER),
    multerUpload.array("files"),
    validateRequest(updateProductValidationSchema),
    productController.updateProduct,
);

router.delete('/:id', checkAuth(UserRole.ADMIN, UserRole.MANAGER), productController.deleteProduct);

export const productRoutes = router;