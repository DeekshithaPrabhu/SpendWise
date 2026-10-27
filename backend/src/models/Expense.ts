import { Schema, model, Types } from 'mongoose';

export interface IExpense {
  user: Types.ObjectId;
  title: string;
  amount: number;
  category: Types.ObjectId;
  date: Date;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank';
  notes?: string;
}

const expenseSchema = new Schema<IExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    date: { type: Date, default: Date.now, index: true },
    paymentMethod: { type: String, enum: ['cash', 'card', 'upi', 'bank'], default: 'cash' },
    notes: String,
  },
  { timestamps: true }
);

export const Expense = model<IExpense>('Expense', expenseSchema);
