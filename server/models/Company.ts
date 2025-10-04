import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  _id: string;
  name: string;
  currency: string;
  approvalThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  approvalThreshold: {
    type: Number,
    required: true,
    default: 1000,
    min: 0
  }
}, {
  timestamps: true
});

export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
