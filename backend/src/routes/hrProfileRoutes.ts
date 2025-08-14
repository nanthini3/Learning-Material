// Add this to your existing HR routes file or create a new profile routes file

import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { HrUser } from '../models/HrUserModel';
import { authMiddleware } from '../middleware/auth'; // You'll need to create this

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// UPDATE PROFILE ROUTE
router.put('/profile/:id', authMiddleware, upload.single('profileImage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, department, role, currentPassword, newPassword } = req.body;
    
    // Verify user exists and matches the authenticated user
    const user = await HrUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the authenticated user is updating their own profile
    // (assuming req.user is set by authMiddleware)
    if (req.user.userId !== id) {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    // Check if email is already taken by another user
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await HrUser.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email is already in use by another account' 
        });
      }
    }

    // Handle password change if provided
    if (currentPassword && newPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
      }

      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (department) user.department = department;
    if (role) user.role = role;

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if it exists
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), user.avatar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new profile image path
      user.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // Save updated user
    await user.save();

    // Return updated user data (excluding password)
    const updatedUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      avatar: user.avatar
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUserData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(process.cwd(), 'uploads/profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// GET PROFILE ROUTE
router.get('/profile/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await HrUser.findById(id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }