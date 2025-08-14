// src/middleware/employeeAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/EmployeeModel'; // Assuming you have an Employee model

// Extend Request interface to include employee data
export interface EmployeeAuthRequest extends Request {
  employee?: {
    id: string;
    email: string;
    name: string;
    empId?: string;
  };
}

export const authenticateEmployeeToken = async (
  req: EmployeeAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify the token
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ JWT_SECRET_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Internal server error - JWT configuration missing'
      });
    }

    const decoded = jwt.verify(token, secretKey) as any;
    console.log('🔍 Decoded employee token:', decoded);

    // Check if the token is for an employee
    if (decoded.type !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Invalid token type.'
      });
    }

    // Find the employee in the database
    const employee = await Employee.findById(decoded.id).select('-password');
    
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Employee not found.'
      });
    }

    // Check if employee account is active
    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact HR.'
      });
    }

    // Attach employee info to request object
    req.employee = {
      id: employee._id.toString(),
      email: employee.email,
      name: employee.name,
      empId: employee.empId
    };

    console.log('✅ Employee authenticated:', req.employee.email);
    next();

  } catch (error: any) {
    console.error('❌ Employee authentication error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};