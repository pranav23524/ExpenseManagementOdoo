import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  companyId: string;
  companyName: string;
  managerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    required: true,
    index: true
  },
  companyId: {
    type: String,
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true
  },
  managerId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
