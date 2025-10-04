import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface IApprovalRule extends Document {
  _id: string;
  companyId: string;
  name: string;
  condition: 'amount' | 'category';
  value: string | number;
  approverRole: UserRole;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRuleSchema = new Schema<IApprovalRule>({
  companyId: {
    type: String,
    required: true,
    ref: 'Company'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  condition: {
    type: String,
    enum: ['amount', 'category'],
    required: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  approverRole: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ApprovalRuleSchema.index({ companyId: 1 });
ApprovalRuleSchema.index({ enabled: 1 });
ApprovalRuleSchema.index({ condition: 1 });

export const ApprovalRule = mongoose.models.ApprovalRule || mongoose.model<IApprovalRule>('ApprovalRule', ApprovalRuleSchema);
