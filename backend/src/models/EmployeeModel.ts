// src/models/EmployeeModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  name: string;
  email: string;
  department: string;
  identityNumber?: string;
  phoneNumber?: string;
  position?: string;
  hrId: mongoose.Types.ObjectId; // Reference to the HR who created this employee
  
  // Password-related fields (moved from User model)
  password?: string;
  isPasswordSet: boolean;
  passwordSetToken?: string;
  passwordSetExpires?: Date;
  isActive: boolean;
  lastLogin?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be longer than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Employee email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [50, 'Department cannot be longer than 50 characters']
  },
  identityNumber: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple null values but unique non-null values
    maxlength: [20, 'Identity number cannot be longer than 20 characters']
  },
  phoneNumber: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [50, 'Position cannot be longer than 50 characters']
  },
  hrId: {
    type: Schema.Types.ObjectId,
    ref: 'HrUser',
    required: true
  },
  
  // Password-related fields
  password: {
    type: String,
    select: false // Don't include in queries by default
  },
  isPasswordSet: {
    type: Boolean,
    default: false
  },
  passwordSetToken: {
    type: String,
    select: false // Don't include in queries by default
  },
  passwordSetExpires: {
    type: Date,
    select: false // Don't include in queries by default
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Create indexes for better performance
employeeSchema.index({ email: 1 });
employeeSchema.index({ hrId: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ passwordSetToken: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);