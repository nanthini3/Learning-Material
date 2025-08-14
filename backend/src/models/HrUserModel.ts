// src/models/HrUserModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IHrUser extends Document {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
  avatar?: string; // NEW: Add avatar field
  // These fields are REQUIRED for password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const hrUserSchema = new Schema<IHrUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    default: 'hr'
  },
  department: {
    type: String,
    default: 'Human Resources'
  },
  avatar: { // NEW: Avatar field for profile pictures
    type: String,
    default: null
  },
  // Add these fields for password reset
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  }
}, {
  timestamps: true
});

// Create unique index for email
hrUserSchema.index({ email: 1 }, { unique: true });

export const HrUser = mongoose.model<IHrUser>('HrUser', hrUserSchema);