// src/models/ModuleModel.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IModule extends Document {
  title: string;
  description: string;
  learningObjectives: string[];
  hrId: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be longer than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be longer than 2000 characters']
  },
  learningObjectives: {
    type: [String],
    required: [true, 'At least one learning objective is required'],
    validate: {
      validator: function(objectives: string[]) {
        return objectives && objectives.length > 0 && objectives.some(obj => obj.trim().length > 0);
      },
      message: 'At least one learning objective is required'
    }
  },
  hrId: {
    type: Schema.Types.ObjectId,
    ref: 'HrUser',
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: 'Status must be either draft, published, or archived'
    },
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
moduleSchema.index({ hrId: 1 });
moduleSchema.index({ title: 1 });
moduleSchema.index({ status: 1 });
moduleSchema.index({ createdAt: -1 });
moduleSchema.index({ hrId: 1, status: 1 });

export const Module = mongoose.model<IModule>('Module', moduleSchema);

// Migration function to update existing modules
export const migrateExistingModules = async () => {
  try {
    console.log('🔄 Starting module migration...');
    
    // Update all modules that don't have a status field
    const result = await Module.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'published' } }
    );
    
    console.log(`✅ Migration completed: ${result.modifiedCount} modules updated`);
    return result;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Don't throw error to prevent server from crashing
    return { modifiedCount: 0, matchedCount: 0 };
  }
};