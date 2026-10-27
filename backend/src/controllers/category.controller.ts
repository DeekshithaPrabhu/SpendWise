import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureDefaultCategories } from '../utils/defaultCategories';

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  await ensureDefaultCategories(req.userId!);
  res.json(await Category.find({ user: req.userId }).sort({ sortOrder: 1, createdAt: 1 }));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, color, icon } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });
  const category = await Category.create({ name, color, icon, user: req.userId });
  res.status(201).json(category);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ _id: req.params.id, user: req.userId });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  if (category.isDefault) return res.status(400).json({ message: 'Default categories cannot be deleted' });
  await category.deleteOne();
  res.status(204).send();
});
