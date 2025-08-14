// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string; // Add role for HR verification
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('1. Request URL:', req.originalUrl);
  console.log('2. Request method:', req.method);
  
  try {
    const authHeader = req.header('Authorization');
    console.log('3. Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('4. Auth header value:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('5. Token extracted:', token ? 'Yes' : 'No');
    console.log('6. Token length:', token?.length);
    console.log('7. Token first 20 chars:', token?.substring(0, 20));

    if (!token) {
      console.log('❌ ERROR: No token provided');
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    console.log('8. JWT Secret exists:', !!process.env.JWT_SECRET);
    console.log('9. JWT Secret length:', process.env.JWT_SECRET?.length);

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    console.log('10. Token decoded successfully');
    console.log('11. Decoded payload:', decoded);
    console.log('12. User ID:', decoded.userId || decoded.id);
    console.log('13. User email:', decoded.email);
    console.log('14. User role:', decoded.role);

    // Set user data
    req.user = {
      userId: decoded.userId || decoded.id, // Handle both possible field names
      email: decoded.email,
      role: decoded.role
    };
    
    console.log('15. Request user set:', req.user);
    console.log('✅ Auth middleware success');
    console.log('=== END AUTH MIDDLEWARE DEBUG ===');
    
    next();
  } catch (error) {
    console.log('❌ AUTH MIDDLEWARE ERROR:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('JWT Error type:', error.name);
      console.log('JWT Error message:', error.message);
      
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
    
    console.log('=== END AUTH MIDDLEWARE DEBUG ===');
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Additional middleware specifically for HR routes
export const hrAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // First run the regular auth middleware
  authMiddleware(req, res, (error) => {
    if (error) return;
    
    console.log('=== HR AUTH CHECK ===');
    console.log('User role:', req.user?.role);
    
    // Check if user has HR role
    const userRole = req.user?.role?.toLowerCase();
    if (userRole !== 'hr') {
      console.log('❌ ACCESS DENIED: User is not HR');
      return res.status(403).json({
        success: false,
        message: 'Access denied. HR privileges required.'
      });
    }
    
    console.log('✅ HR access granted');
    console.log('=== END HR AUTH CHECK ===');
    next();
  });
};