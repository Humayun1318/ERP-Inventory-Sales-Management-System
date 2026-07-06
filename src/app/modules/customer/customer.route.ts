import { Router } from 'express';
import { customerController } from './customer.controller';

const router = Router();

router.post('/create', customerController.createCustomer);
router.patch('/update/:id', customerController.updateCustomer);
router.delete('/delete/:id', customerController.deleteCustomer);
router.get('/:id', customerController.getCustomerById);
router.get('/', customerController.getAllCustomer);

export const customerRoutes = router;