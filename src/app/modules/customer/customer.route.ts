import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { customerController } from './customer.controller';
import {
  createCustomerZodSchema,
  updateCustomerZodSchema,
} from './customer.validation';
import { UserRole } from '../user/user.constants';

const router = Router();

// "Manage Customers" is a Manager/Admin permission — Employee is not
// listed for customer access in the role table, only "Create Sales".
router.post(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createCustomerZodSchema),
  customerController.createCustomer,
);

router.get(
  '/',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  customerController.getAllCustomers,
);

router.get(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  customerController.getSingleCustomer,
);

router.patch(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateCustomerZodSchema),
  customerController.updateCustomer,
);

router.delete(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER),
  customerController.deleteCustomer,
);

export const customerRoutes = router;
