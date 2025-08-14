// src/middleware/unifiedAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/UserModel';
import { HrUser } from '../models/HrUserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    type: 'user' | 'hr';
    role?: string;
  };
}

// Base authentication middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('=== UNIFIED AUTH MIDDLEWARE ===');
    console.log('1. Request URL:', req.originalUrl);
    console.log('2. Request method:', req.method);

    const authHeader = req.headers.authorization;
    console.log('3. Auth header exists:', !!authHeader);

    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    console.log('4. Token length:', token.length);

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('5. Token decoded successfully');
    console.log('6. Decoded payload:', decoded);

    // Set user data with consistent structure
    req.user = {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      type: decoded.type,
      role: decoded.role
    };

    console.log('7. Request user set:', req.user);
    console.log('✅ Base authentication successful');
    console.log('=== END UNIFIED AUTH MIDDLEWARE ===');
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// HR-specific middleware
export const requireHR = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, async (error) => {
    if (error) return;

    try {
      console.log('=== HR AUTHORIZATION CHECK ===');
      console.log('User type:', req.user?.type);
      console.log('User role:', req.user?.role);

      // Check if user has HR type
      if (req.user?.type !== 'hr') {
        console.log('❌ ACCESS DENIED: User type is not HR');
        return res.status(403).json({
          success: false,
          message: 'Access denied. HR privileges required.'
        });
      }

      // Optional: Additional check to verify HR user still exists and is active
      const hrUser = await HrUser.findById(req.user.userId);
      if (!hrUser) {
        console.log('❌ HR user not found in database');
        return res.status(401).json({
          success: false,
          message: 'HR user not found'
        });
      }

      console.log('✅ HR access granted');
      console.log('=== END HR AUTHORIZATION CHECK ===');
      next();
    } catch (dbError) {
      console.error('❌ Database error during HR check:', dbError);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  });
};

// User-specific middleware
export const requireUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  authenticate(req, res, async (error) => {
    if (error) return;

    try {
      console.log('=== USER AUTHORIZATION CHECK ===');
      console.log('User type:', req.user?.type);

      // Check if user has user type
      if (req.user?.type !== 'user') {
        console.log('❌ ACCESS DENIED: User type is not user');
        return res.status(403).json({
          success: false,
          message: 'Access denied. User privileges required.'
        });
      }

      // Optional: Additional check to verify user still exists and is active
      const user = await User.findById(req.user.userId);
      if (!user || !user.isActive) {
        console.log('❌ User not found or inactive');
        return res.status(401).json({
          success: false,
          message: 'User not found or inactive'
        });
      }

      // Check if user has set password
      if (!user.isPasswordSet) {
        return res.status(401).json({
          success: false,
          message: 'Password not set. Please complete account setup.'
        });
      }

      console.log('✅ User access granted');
      console.log('=== END USER AUTHORIZATION CHECK ===');
      next();
    } catch (dbError) {
      console.error('❌ Database error during user check:', dbError);
      res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  });
};