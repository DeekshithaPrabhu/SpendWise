import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Expense } from '../models/Expense';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';

const DAY = 86_400_000;
const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Parses "YYYY-MM-DD" as the start of that day in the client's timezone. */
const startOfLocalDay = (s: string, offset: number) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + offset * 60_000);
};

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { date: -1, createdAt: -1 },
  oldest: { date: 1, createdAt: 1 },
  highest: { amount: -1, date: -1 },
  lowest: { amount: 1, date: -1 },
};

/**
 * GET /api/expenses?search=&category=&month=YYYY-MM&from=YYYY-MM-DD&to=YYYY-MM-DD&sort=&tzOffset=
 * `month` takes precedence over from/to. `to` is inclusive.
 */
export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const offset = Number(q.tzOffset) || 0;
  const filter: Record<string, any> = { user: req.userId };

  if (q.category && Types.ObjectId.isValid(q.category)) filter.category = q.category;

  if (q.search?.trim()) filter.title = { $regex: escapeRegex(q.search.trim()), $options: 'i' };

  if (q.month && /^\d{4}-\d{2}$/.test(q.month)) {
    const [y, m] = q.month.split('-').map(Number);
    filter.date = {
      $gte: new Date(Date.UTC(y, m - 1, 1) + offset * 60_000),
      $lt: new Date(Date.UTC(y, m, 1) + offset * 60_000),
    };
  } else {
    const range: Record<string, Date> = {};
    if (q.from && /^\d{4}-\d{2}-\d{2}$/.test(q.from)) range.$gte = startOfLocalDay(q.from, offset);
    if (q.to && /^\d{4}-\d{2}-\d{2}$/.test(q.to)) {
      range.$lt = new Date(startOfLocalDay(q.to, offset).getTime() + DAY);
    }
    if (Object.keys(range).length) filter.date = range;
  }

  const expenses = await Expense.find(filter)
    .populate('category', 'name color icon')
    .sort(SORTS[q.sort ?? ''] ?? SORTS.newest);
  res.json(expenses);
});

export const getExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId }).populate('category');
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  if (!(await Category.exists({ _id: req.body.category, user: req.userId }))) {
    return res.status(400).json({ message: 'Invalid category' });
  }
  const expense = await Expense.create({ ...req.body, user: req.userId });
  res.status(201).json(expense);
});

export const updateExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.status(204).send();
});
