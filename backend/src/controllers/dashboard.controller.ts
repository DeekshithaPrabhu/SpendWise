import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Expense } from '../models/Expense';
import { asyncHandler } from '../utils/asyncHandler';

const DAY = 86_400_000;

/**
 * GET /api/dashboard/summary?tzOffset=<minutes>
 * tzOffset is the browser's Date#getTimezoneOffset() so "today" and "this month"
 * follow the user's local calendar rather than the server's.
 */
export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const offset = Number(req.query.tzOffset) || 0;
  const localNow = new Date(Date.now() - offset * 60_000); // read with getUTC* = local wall clock
  const y = localNow.getUTCFullYear();
  const m = localNow.getUTCMonth();
  const dayOfMonth = localNow.getUTCDate();

  const startOfToday = new Date(Date.UTC(y, m, dayOfMonth) + offset * 60_000);
  const startOfTomorrow = new Date(startOfToday.getTime() + DAY);
  const startOfMonth = new Date(Date.UTC(y, m, 1) + offset * 60_000);
  const startOfNextMonth = new Date(Date.UTC(y, m + 1, 1) + offset * 60_000);
  const user = new Types.ObjectId(req.userId);

  const [monthAgg, todayAgg, categoryAgg] = await Promise.all([
    Expense.aggregate([
      { $match: { user, date: { $gte: startOfMonth, $lt: startOfNextMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user, date: { $gte: startOfToday, $lt: startOfTomorrow } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user, date: { $gte: startOfMonth, $lt: startOfNextMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
    ]),
  ]);

  const totalThisMonth: number = monthAgg[0]?.total ?? 0;
  const top = categoryAgg[0];

  res.json({
    totalThisMonth,
    totalToday: todayAgg[0]?.total ?? 0,
    averageDaily: dayOfMonth > 0 ? totalThisMonth / dayOfMonth : 0,
    daysElapsed: dayOfMonth,
    highestCategory: top
      ? {
          id: top._id,
          name: top.category.name,
          icon: top.category.icon,
          color: top.category.color,
          total: top.total,
          share: totalThisMonth ? top.total / totalThisMonth : 0,
        }
      : null,
  });
});
