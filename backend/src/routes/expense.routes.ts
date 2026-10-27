import { Router } from 'express';
import {
  createExpense, deleteExpense, getExpense, getExpenses, updateExpense,
} from '../controllers/expense.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);
router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

export default router;
