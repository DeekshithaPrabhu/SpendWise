import { Router } from 'express';
import { createCategory, deleteCategory, getCategories } from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);
router.route('/').get(getCategories).post(createCategory);
router.delete('/:id', deleteCategory);

export default router;
