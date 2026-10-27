import { Schema, model, Types } from 'mongoose';

export interface ICategory {
  user: Types.ObjectId;
  name: string;
  color: string;
  icon?: string;
  isDefault: boolean;
  sortOrder: number;
}

const categorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: '#0071e3' },
    icon: String,
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

categorySchema.index({ user: 1, name: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
