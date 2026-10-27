import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  res.json(await Category.find({ user: req.userId }).sort({ name: 1 }));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create({ ...req.body, user: req.userId });
  res.status(201).json(category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.status(204).send();
});
