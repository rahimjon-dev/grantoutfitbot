import { Router } from 'express';
import { productController } from '../controllers/productController.js';

const router = Router();

router.get('/categories', productController.getCategories);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

export default router;
