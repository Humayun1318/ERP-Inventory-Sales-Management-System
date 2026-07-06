import { Router } from 'express';
import { dashboardController } from './dashboard.controller';

const router = Router();

router.post('/create', dashboardController.createDashboard);
router.patch('/update/:id', dashboardController.updateDashboard);
router.delete('/delete/:id', dashboardController.deleteDashboard);
router.get('/:id', dashboardController.getDashboardById);
router.get('/', dashboardController.getAllDashboard);

export const dashboardRoutes = router;