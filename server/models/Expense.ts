import mongoose, { Document, Schema } from 'mongoose';

export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type ExpenseCategory = 'travel' | 'meals' | 'office' | 'equipment' | 'other';

export interface IExpense extends Document {
  _id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  merchant: string;
  date: Date;
  status: ExpenseStatus;
  receiptUrl?: string;
  receiptName?: string;
  submittedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  category: {
    type: String,
    enum: ['travel', 'meals', 'office', 'equipment', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  merchant: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  receiptUrl: {
    type: String,
    default: null
  },
  receiptName: {
    type: String,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: String,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ExpenseSchema.index({ userId: 1 });
ExpenseSchema.index({ status: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ submittedAt: -1 });
ExpenseSchema.index({ companyId: 1 });

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
