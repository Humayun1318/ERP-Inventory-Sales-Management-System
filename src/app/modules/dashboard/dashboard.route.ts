import { Router } from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { dashboardController } from './dashboard.controller';
import { UserRole } from '../user/user.constants';

const router = Router();

// Reporting data — restricted to Admin/Manager, same tier as "Manage
// Products"/"Manage Customers" permissions. Employee has no listed
// dashboard/reporting permission in your role table.
router.get(
  '/summary',
  checkAuth(UserRole.ADMIN, UserRole.MANAGER),
  dashboardController.getSummary,
);

export const dashboardRoutes = router;
