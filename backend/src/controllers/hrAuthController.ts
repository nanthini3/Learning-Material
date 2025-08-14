// src/controllers/hrAuthController.ts
import { Request, Response } from 'express'
import { HrUser } from '../models/HrUserModel'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'

// Extend Request interface to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const registerHr = async (req: Request, res: Response) => {
  const { name, email, department, role, password } = req.body

  try {
    console.log('=== HR REGISTRATION ATTEMPT ===');
    console.log('Registration data:', { name, email, department, role });

    // Validate required fields
    if (!name || !email || !department || !password) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      })
    }

    // Check if user already exists
    const existingUser = await HrUser.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create new user
    const newUser = await HrUser.create({
      name,
      email,
      department,
      role: role || 'HR',
      password: hashedPassword,
    })

    // ✅ FIXED: Generate JWT token with correct structure
    const tokenPayload = {
      userId: newUser._id, 
      email: newUser.email,
      type: 'hr', // ✅ Changed from 'role' to 'type'
      role: newUser.role || 'hr'
    };

    console.log('Token payload being generated:', tokenPayload);

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    console.log('✅ HR registration successful');

    // Return success response - ✅ FIXED: Include avatar field
    res.status(201).json({
      message: 'HR user registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
        avatar: newUser.avatar || null, // ✅ FIXED: Include avatar field
        type: 'hr' // ✅ Include type in response
      },
    })
  } catch (err: any) {
    console.error('Registration error:', err)
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      })
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e: any) => e.message)
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      })
    }
    
    res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    })
  }
}

export const loginHr = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    console.log('=== HR LOGIN ATTEMPT ===');
    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      })
    }

    // Find user by email
    const user = await HrUser.findOne({ email })
    if (!user) {
      console.log('❌ HR user not found');
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      })
    }

    // ✅ FIXED: Generate JWT token with correct structure
    const tokenPayload = {
      userId: user._id, 
      email: user.email,
      type: 'hr', // ✅ Changed from 'role' to 'type'
      role: user.role || 'hr'
    };

    console.log('Token payload being generated:', tokenPayload);

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

    console.log('✅ HR login successful');
    console.log('User avatar in database:', user.avatar); // ✅ Debug log

    // Return success response - ✅ FIXED: Include avatar field
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        avatar: user.avatar || null, // ✅ FIXED: Include avatar field
        type: 'hr' // ✅ Include type in response
      },
    })
  } catch (err: any) {
    console.error('Login error:', err)
    res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    })
  }
}

// NEW: Change Password function (without current password verification)
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user?.userId;

    // Validation
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Find user
    const user = await HrUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await HrUser.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ✅ NEW: Add a dedicated route to get current user profile
export const getCurrentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Find user and exclude password
    const user = await HrUser.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        avatar: user.avatar || null, // ✅ Always include avatar
        type: 'hr'
      }
    });

  } catch (error) {
    console.error('Get current profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};