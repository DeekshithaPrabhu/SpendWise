import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

const signToken = (id: string) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
