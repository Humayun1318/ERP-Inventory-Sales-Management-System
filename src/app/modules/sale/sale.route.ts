import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { saleController } from './sale.controller';
import { createSaleValidationSchema } from './sale.validation';
import { UserRole } from '../user/user.constants';

const router = Router();

// Manager: "Create Sales" | Employee: "Create Sales" | Admin: full access
router.post(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  validateRequest(createSaleValidationSchema),
  saleController.createSale,
);

router.get(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  saleController.getAllSales,
);

router.get(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  saleController.getSingleSale,
);

export const saleRoutes = router;
