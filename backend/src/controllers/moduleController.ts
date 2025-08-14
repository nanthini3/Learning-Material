// src/controllers/moduleController.ts
import { Request, Response } from 'express';
import { Module } from '../models/ModuleModel';
import { HrUser } from '../models/HrUserModel';

// Updated interface to match different possible auth structures
interface AuthRequest extends Request {
  user?: {
    userId?: string;
    hrId?: string;
    id?: string;
    email: string;
    type: string;
    role?: string;
  };
}

// Helper function to get user ID from different possible fields
const getUserId = (user: any): string | null => {
  return user?.userId || user?.hrId || user?.id || null;
};

// Get all modules for the logged-in HR
export const getAllModules = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Auth Debug - req.user:', req.user);
    
    const userId = getUserId(req.user);
    console.log('🔍 Extracted userId:', userId);

    if (!userId) {
      console.error('❌ User ID missing. Available user data:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - User ID missing'
      });
    }

    console.log('✅ Fetching modules for HR user:', userId);

    // Find all modules created by this HR
    const modules = await Module.find({ hrId: userId })
      .select('-hrId') // Exclude hrId from response
      .sort({ createdAt: -1 }); // Sort by newest first

    console.log(`✅ Found ${modules.length} modules for HR user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'Modules retrieved successfully',
      modules
    });

  } catch (error) {
    console.error('❌ Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a new module
export const createModule = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== CREATE MODULE DEBUG ===');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);

    const { title, description, learningObjectives, status = 'draft' } = req.body;
    const userId = getUserId(req.user);

    if (!userId) {
      console.error('❌ User ID missing. Available user data:', req.user);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - User ID missing'
      });
    }

    // Validate required fields
    if (!title || !description || !learningObjectives) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and learning objectives are required'
      });
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be draft, published, or archived'
      });
    }

    // Validate learning objectives
    if (!Array.isArray(learningObjectives) || learningObjectives.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one learning objective is required'
      });
    }

    // Filter out empty objectives and validate
    const validObjectives = learningObjectives
      .map((obj: string) => obj.trim())
      .filter((obj: string) => obj.length > 0);

    if (validObjectives.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid learning objective is required'
      });
    }

    // Verify HR user exists
    const hrUser = await HrUser.findById(userId);
    if (!hrUser) {
      return res.status(404).json({
        success: false,
        message: 'HR user not found'
      });
    }

    // Check if module with this title already exists for this HR
    const existingModule = await Module.findOne({ 
      title: title.trim(), 
      hrId: userId 
    });
    
    if (existingModule) {
      return res.status(400).json({
        success: false,
        message: 'A module with this title already exists'
      });
    }

    // Create new module
    const newModule = await Module.create({
      title: title.trim(),
      description: description.trim(),
      learningObjectives: validObjectives,
      status,
      hrId: userId,
      isActive: true
    });

    console.log('✅ Module created successfully:', newModule.title);

    // Return the created module without sensitive data
    const moduleResponse = {
      id: newModule._id,
      title: newModule.title,
      description: newModule.description,
      learningObjectives: newModule.learningObjectives,
      status: newModule.status,
      isActive: newModule.isActive,
      createdAt: newModule.createdAt,
      updatedAt: newModule.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      module: moduleResponse
    });

  } catch (error: any) {
    console.error('❌ Create module error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A module with this title already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get a single module by ID
export const getModuleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const module = await Module.findOne({ _id: id, hrId: userId })
      .select('-hrId');

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Module retrieved successfully',
      module
    });

  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update a module
export const updateModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, learningObjectives } = req.body;
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Validate required fields
    if (!title || !description || !learningObjectives) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and learning objectives are required'
      });
    }

    // Validate learning objectives
    if (!Array.isArray(learningObjectives) || learningObjectives.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one learning objective is required'
      });
    }

    // Filter out empty objectives and validate
    const validObjectives = learningObjectives
      .map((obj: string) => obj.trim())
      .filter((obj: string) => obj.length > 0);

    if (validObjectives.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid learning objective is required'
      });
    }

    // Check if module exists and belongs to this HR
    const module = await Module.findOne({ _id: id, hrId: userId });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Check if title is being changed and if it already exists
    if (title.trim() !== module.title) {
      const existingModule = await Module.findOne({ 
        title: title.trim(),
        hrId: userId,
        _id: { $ne: id }
      });
      if (existingModule) {
        return res.status(400).json({
          success: false,
          message: 'A module with this title already exists'
        });
      }
    }

    // Update module
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        learningObjectives: validObjectives,
      },
      { new: true, runValidators: true }
    ).select('-hrId');

    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      module: updatedModule
    });

  } catch (error: any) {
    console.error('Update module error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A module with this title already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e: any) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update module status
export const updateModuleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be draft, published, or archived'
      });
    }

    // Check if module exists and belongs to this HR
    const module = await Module.findOne({ _id: id, hrId: userId });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Update module status
    const updatedModule = await Module.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-hrId');

    res.status(200).json({
      success: true,
      message: `Module ${status === 'published' ? 'published' : status === 'archived' ? 'archived' : 'saved as draft'} successfully`,
      module: updatedModule
    });

  } catch (error) {
    console.error('Update module status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete a module
export const deleteModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Check if module exists and belongs to this HR
    const module = await Module.findOne({ _id: id, hrId: userId });
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Delete the module
    await Module.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully'
    });

  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get module statistics
export const getModuleStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Get total count
    const totalModules = await Module.countDocuments({ hrId: userId });

    // Get status counts
    const draftModules = await Module.countDocuments({ hrId: userId, status: 'draft' });
    const publishedModules = await Module.countDocuments({ hrId: userId, status: 'published' });
    const archivedModules = await Module.countDocuments({ hrId: userId, status: 'archived' });

    // Get active/inactive counts
    const activeModules = await Module.countDocuments({ hrId: userId, isActive: true });
    const inactiveModules = await Module.countDocuments({ hrId: userId, isActive: false });

    // Get recent modules (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentModules = await Module.countDocuments({
      hrId: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      message: 'Module statistics retrieved successfully',
      stats: {
        totalModules,
        draftModules,
        publishedModules,
        archivedModules,
        activeModules,
        inactiveModules,
        recentModules
      }
    });

  } catch (error) {
    console.error('Get module stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// NEW: Get published modules for employees
export const getPublishedModulesForEmployee = async (req: Request, res: Response) => {
  try {
    console.log('🎓 Employee requesting published modules...');
    
    // Get all published modules
    const modules = await Module.find({ 
      status: 'published',
      isActive: true 
    })
    .select('-hrId') // Don't expose HR info to employees
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${modules.length} published modules for employee`);

    // In a real application, you might want to include employee progress data
    // For now, we'll return basic module data with default progress
    const modulesWithProgress = modules.map(module => ({
      ...module.toObject(),
      progress: 0, // Default progress - you can implement actual progress tracking later
      isCompleted: false,
      startedAt: null,
      completedAt: null
    }));

    res.status(200).json({
      success: true,
      message: 'Published modules retrieved successfully',
      modules: modulesWithProgress,
      total: modules.length
    });

  } catch (error) {
    console.error('❌ Get employee modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};