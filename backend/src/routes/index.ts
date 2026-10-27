import { Router } from 'express';
import authRoutes from './auth.routes';
import expenseRoutes from './expense.routes';
import categoryRoutes from './category.routes';

const router = Router();
router.get('/health', (_req, res) => res.json({ status: 'ok', app: 'SpendWise API' }));
router.use('/auth', authRoutes);
router.use('/expenses', expenseRoutes);
router.use('/categories', categoryRoutes);

export default router;
