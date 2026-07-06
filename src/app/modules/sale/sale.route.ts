import { Router } from 'express';
import { saleController } from './sale.controller';

const router = Router();

router.post('/create', saleController.createSale);
router.patch('/update/:id', saleController.updateSale);
router.delete('/delete/:id', saleController.deleteSale);
router.get('/:id', saleController.getSaleById);
router.get('/', saleController.getAllSale);

export const saleRoutes = router;