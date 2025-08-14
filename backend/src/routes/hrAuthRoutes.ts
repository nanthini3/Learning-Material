// src/routes/hrAuthRoutes.ts
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { HrUser } from '../models/HrUserModel';
import { authMiddleware } from '../middleware/auth';
import { registerHr, loginHr, changePassword, getCurrentProfile } from '../controllers/hrAuthController'; // ✅ Import new function

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'src/uploads/profiles';
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

// ✅ Use controller functions instead of inline logic
router.post('/register', registerHr);
router.post('/login', loginHr);

// ✅ NEW: Add route to get current user profile (for refreshing user data)
router.get('/profile', authMiddleware, getCurrentProfile);

// FORGOT PASSWORD ROUTE (existing - no change needed)
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await HrUser.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ 
        message: 'The email you entered is not registered. Please check your email and try again.',
        error: 'EMAIL_NOT_REGISTERED'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email
    await sendResetEmail(email, resetToken);

    res.status(200).json({ 
      message: 'Password reset link sent to your email',
      success: true 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// RESET PASSWORD ROUTE (existing - no change needed)
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Find user with valid reset token
    const user = await HrUser.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Password reset successful',
      success: true 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// UPDATE PROFILE ROUTE - ✅ IMPROVED: Better error handling and avatar management
router.put('/profile/:id', authMiddleware, upload.single('profileImage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, department, role, currentPassword, newPassword } = req.body;
    
    console.log('Profile update request for user:', id); // ✅ Debug log
    console.log('File uploaded:', req.file ? req.file.filename : 'No file'); // ✅ Debug log
    
    // Verify user exists and matches the authenticated user
    const user = await HrUser.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the authenticated user is updating their own profile
    if ((req as any).user.userId !== id) {
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
      console.log('Processing new avatar upload:', req.file.filename); // ✅ Debug log
      
      // Delete old profile image if it exists
      if (user.avatar && user.avatar.startsWith('/uploads/')) {
        const oldImagePath = path.join(process.cwd(), 'src', user.avatar);
        if (fs.existsSync(oldImagePath)) {
          console.log('Deleting old avatar:', oldImagePath); // ✅ Debug log
          fs.unlinkSync(oldImagePath);
        }
      }
      
      // Set new profile image path
      user.avatar = `/uploads/profiles/${req.file.filename}`;
      console.log('New avatar path set:', user.avatar); // ✅ Debug log
    }

    // Save updated user
    await user.save();
    console.log('User saved with avatar:', user.avatar); // ✅ Debug log

    // Return updated user data (excluding password)
    const updatedUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role,
      avatar: user.avatar || null, // ✅ FIXED: Always include avatar
      type: 'hr' // ✅ Include type
    };

    console.log('Returning updated user data:', updatedUserData); // ✅ Debug log

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUserData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(process.cwd(), 'src/uploads/profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if ((error as Error).message === 'Only image files are allowed') {
      return res.status(400).json({ message: (error as Error).message });
    }

    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// GET PROFILE ROUTE (existing - ✅ IMPROVED)
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
        avatar: user.avatar || null, // ✅ FIXED: Always include avatar
        type: 'hr' // ✅ Include type
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EMAIL SENDING FUNCTION (existing - no change needed)
async function sendResetEmail(email: string, resetToken: string) {
  try {
    console.log('Attempting to send email to:', email);
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test the connection
    await transporter.verify();
    console.log('SMTP connection verified');

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Learning Material Platform',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password for your Learning Material Platform account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reset email sent successfully to:', email);
    console.log('Message ID:', info.messageId);

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}

// ✅ Use controller function
router.post('/change-password', authMiddleware, changePassword);

export default router;