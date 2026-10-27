import { Schema, model, Types } from 'mongoose';

export interface ICategory {
  user: Types.ObjectId;
  name: string;
  color: string;
  icon?: string;
}

const categorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#6366f1' },
    icon: String,
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
