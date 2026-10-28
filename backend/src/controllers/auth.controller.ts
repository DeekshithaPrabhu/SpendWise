import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureDefaultCategories } from '../utils/defaultCategories';
import { sendMail } from '../utils/mailer';

const signToken = (id: string) =>
  jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const user = await User.create({ name, email, password });
  await ensureDefaultCategories(user.id);
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

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const RESET_TTL_MS = 15 * 60 * 1000;

/** POST /api/auth/forgot-password — 404 if the email isn't registered, otherwise emails a reset link. */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  if (!email) return res.status(400).json({ message: 'Please enter your email address' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No account found with this email address' });

  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne(
    { _id: user._id },
    { resetPasswordToken: sha256(token), resetPasswordExpires: new Date(Date.now() + RESET_TTL_MS) }
  );

  const link = `${env.clientUrl}/reset-password/${token}`;
  try {
    await sendMail({
      to: user.email,
      subject: 'Reset your SpendWise password',
      text: `Hi ${user.name},\n\nUse this link to reset your password (valid for 15 minutes):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
      html: `<p>Hi ${user.name},</p><p><a href="${link}">Reset your password</a> (link valid for 15 minutes).</p><p>If you didn't ask for this, you can ignore this email.</p>`,
    });
  } catch (err) {
    console.error('Failed to send reset email', err);
    await User.updateOne({ _id: user._id }, { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } });
    return res.status(500).json({ message: "We couldn't send the email. Please try again later." });
  }

  res.json({ message: 'Reset link sent. Check your inbox.' });
});

/** POST /api/auth/reset-password/:token — sets a new password and signs the user in. */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const user = await User.findOne({
    resetPasswordToken: sha256(req.params.token),
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired' });

  user.password = password; // hashed by the pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, currency: user.currency },
  });
});
