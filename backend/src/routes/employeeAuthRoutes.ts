// src/routes/employeeAuthRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Employee } from '../models/EmployeeModel';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    type: string;
  };
}

// Middleware to authenticate employee token
const authenticateEmployeeToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify it's an employee token
    if (decoded.type !== 'employee') {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token type' 
      });
    }

    // 🔒 Check if employee is still active
    const employee = await Employee.findById(decoded.userId);
    if (!employee || !employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ 
      success: false,
      message: 'Invalid or expired token' 
    });
  }
};

// Verify password setup token
router.get('/verify-password-token/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Find employee with valid token
    const employee = await Employee.findOne({
      passwordSetToken: token,
      passwordSetExpires: { $gt: new Date() },
      isPasswordSet: false
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password setup link'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      employee: {
        name: employee.name,
        email: employee.email,
        department: employee.department
      }
    });

  } catch (error) {
    console.error('Verify password token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Set password for employee
router.post('/set-password', async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate input
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, password, and confirm password are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Find employee with valid token
    const employee = await Employee.findOne({
      passwordSetToken: token,
      passwordSetExpires: { $gt: new Date() },
      isPasswordSet: false
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password setup link'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update employee with password
    await Employee.findByIdAndUpdate(employee._id, {
      password: hashedPassword,
      isPasswordSet: true,
      passwordSetToken: undefined,
      passwordSetExpires: undefined,
      updatedAt: new Date()
    });

    console.log('✅ Password set successfully for employee:', employee.email);

    res.status(200).json({
      success: true,
      message: 'Password set successfully! You can now login to the system.'
    });

  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Employee login with isActive check
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find employee by email and include password for comparison
    const employee = await Employee.findOne({ 
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 🔒 Check if employee account is active
    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR for assistance.'
      });
    }

    // Check if password is set
    if (!employee.isPasswordSet || !employee.password) {
      return res.status(400).json({
        success: false,
        message: 'Password not set. Please check your email for setup instructions.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await Employee.findByIdAndUpdate(employee._id, { 
      lastLogin: new Date() 
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: employee._id, 
        email: employee.email, 
        type: 'employee' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Employee login successful:', employee.email);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        phoneNumber: employee.phoneNumber,
        identityNumber: employee.identityNumber,
        avatar: employee.avatar,
        lastLogin: employee.lastLogin,
        isActive: employee.isActive,
        type: 'employee'
      }
    });

  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET current employee profile
router.get('/profile', authenticateEmployeeToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.user?.userId).select('-password -passwordSetToken -passwordSetExpires');
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    res.json({ 
      success: true,
      user: employee 
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// PUT update employee profile by ID
router.put('/profile/:id', authenticateEmployeeToken, upload.single('profileImage'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, department } = req.body;

    // Verify employee can only update their own profile
    if (req.user?.userId !== id && req.user?.email !== email) {
      return res.status(403).json({ 
        success: false,
        message: 'You can only update your own profile' 
      });
    }

    // Find employee by id or email
    let employee = await Employee.findById(id);
    if (!employee) {
      employee = await Employee.findOne({ email: id });
    }
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required' 
      });
    }

    // Check if email is already taken by another employee
    if (email !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: employee._id } 
      });
      if (existingEmployee) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already exists' 
        });
      }
    }

    // Update employee fields
    employee.name = name;
    employee.email = email.toLowerCase().trim();
    employee.department = department || '';
    employee.updatedAt = new Date();

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if exists
      if (employee.avatar) {
        const oldImagePath = path.join(__dirname, '..', employee.avatar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new avatar path (relative to server root)
      employee.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // Save updated employee
    await employee.save();

    // Return updated employee data (exclude sensitive fields)
    const updatedEmployee = await Employee.findById(employee._id).select('-password -passwordSetToken -passwordSetExpires');

    console.log('✅ Employee profile updated:', employee.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedEmployee
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if ((error as any).code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// PUT update current employee's profile (alternative endpoint)
router.put('/profile', authenticateEmployeeToken, upload.single('profileImage'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, department } = req.body;

    // Find employee by JWT token info
    const employee = await Employee.findById(req.user?.userId);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required' 
      });
    }

    // Check if email is already taken by another employee
    if (email !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: employee._id } 
      });
      if (existingEmployee) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already exists' 
        });
      }
    }

    // Update employee fields
    employee.name = name;
    employee.email = email.toLowerCase().trim();
    employee.department = department || '';
    employee.updatedAt = new Date();

    // Handle profile image upload
    if (req.file) {
      // Delete old profile image if exists
      if (employee.avatar) {
        const oldImagePath = path.join(__dirname, '..', employee.avatar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new avatar path (relative to server root)
      employee.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    // Save updated employee
    await employee.save();

    // Return updated employee data (exclude sensitive fields)
    const updatedEmployee = await Employee.findById(employee._id).select('-password -passwordSetToken -passwordSetExpires');

    console.log('✅ Employee profile updated:', employee.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedEmployee
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    
    // Delete uploaded file if there was an error
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if ((error as any).code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already exists' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});

// Change password for employee
router.post('/change-password', authenticateEmployeeToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body;

    // Validate required fields
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Validate new password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Find employee by JWT token info
    const employee = await Employee.findById(req.user?.userId).select('+password');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if new password is different from current password (optional security check)
    if (employee.password) {
      const isSamePassword = await bcrypt.compare(newPassword, employee.password);
      if (isSamePassword) {
        return res.status(400).json({
          success: false,
          message: 'New password must be different from current password'
        });
      }
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update employee password
    await Employee.findByIdAndUpdate(employee._id, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    console.log('✅ Password changed successfully for employee:', employee.email);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing employee password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;