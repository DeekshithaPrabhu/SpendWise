import { Category } from '../models/Category';

export const DEFAULT_CATEGORIES = [
  { name: 'Food', icon: '🍽️', color: '#ff9f0a' },
  { name: 'Transport', icon: '🚗', color: '#0a84ff' },
  { name: 'Shopping', icon: '🛍️', color: '#bf5af2' },
  { name: 'Bills', icon: '🧾', color: '#ff453a' },
  { name: 'Health', icon: '💊', color: '#30d158' },
  { name: 'Entertainment', icon: '🎬', color: '#ff375f' },
  { name: 'Education', icon: '📚', color: '#5e5ce6' },
  { name: 'Other', icon: '✨', color: '#8e8e93' },
];

/** Seeds the default categories for a user who has none yet. Safe to call repeatedly. */
export async function ensureDefaultCategories(userId: string): Promise<void> {
  if ((await Category.countDocuments({ user: userId })) > 0) return;
  try {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c, i) => ({ ...c, user: userId, isDefault: true, sortOrder: i })),
      { ordered: false }
    );
  } catch (err: any) {
    if (err.code !== 11000 && !err.writeErrors) throw err; // ignore duplicate races
  }
}
