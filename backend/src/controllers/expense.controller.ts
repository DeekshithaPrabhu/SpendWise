import { Request, Response } from 'express';
import { Expense } from '../models/Expense';
import { asyncHandler } from '../utils/asyncHandler';

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const expenses = await Expense.find({ user: req.userId })
    .populate('category', 'name color icon')
    .sort({ date: -1 });
  res.json(expenses);
});

export const getExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await Expense.findOne({ _id: req.params.id, user: req.userId }).populate('category');
  if (!expense) return res.status(404).json({ message: 'Expense not found' });
  res.json(expense);
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
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
