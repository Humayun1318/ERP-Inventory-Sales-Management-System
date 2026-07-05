import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { validateRequest } from '../../middlewares/validateRequest';
import { userController } from './user.controller';
import { registerSchema, updateUserZodSchema } from './user.validation';
import { UserRole } from './user.constants';

const router = Router();

router.post(
  '/register',
  validateRequest(registerSchema),
  userController.createUser,
);

router.get(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  userController.getSingleUser,
);

router.patch(
  '/:id',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  validateRequest(updateUserZodSchema),
  userController.updateUser,
);

router.delete('/:id', checkAuth(UserRole.ADMIN), userController.deleteUser);

router.get('/', checkAuth(UserRole.ADMIN), userController.getAllUsers);

export const userRoutes = router;