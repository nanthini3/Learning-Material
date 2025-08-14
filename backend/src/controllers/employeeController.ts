// src/controllers/employeeController.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { Employee } from '../models/EmployeeModel';
import { HrUser } from '../models/HrUserModel';
import { sendEmail, generateWelcomeEmail } from '../services/emailService';

// Extend Request interface to match your middleware
interface AuthRequest extends Request {
  user?: {
    hrId: string;
    email: string;
    type: string;
  };
}

// Get all employees for the logged-in HR
export const getAllEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const hrId = req.user?.hrId;

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - HR ID missing'
      });
    }

    // Find all employees created by this HR
    const employees = await Employee.find({ hrId })
      .select('-hrId') // Exclude hrId from response
      .sort({ createdAt: -1 }); // Sort by newest first

    // Transform isActive to status for frontend compatibility
    const employeesWithStatus = employees.map(employee => ({
      ...employee.toObject(),
      status: employee.isActive ? 'active' : 'inactive'
    }));

    res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      employees: employeesWithStatus
    });

  } catch (error) {
    console.error('❌ Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a new employee - ONLY saves to employees table
export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    console.log('=== CREATE EMPLOYEE DEBUG ===');
    console.log('Request user:', req.user);
    console.log('Request body:', req.body);

    const { name, email, department, identityNumber, phoneNumber, position } = req.body;
    const hrId = req.user?.hrId;

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - HR ID missing'
      });
    }

    // Validate required fields
    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and department are required'
      });
    }

    // Verify HR user exists
    const hrUser = await HrUser.findById(hrId);
    if (!hrUser) {
      return res.status(404).json({
        success: false,
        message: 'HR user not found'
      });
    }

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists'
      });
    }

    // Generate password set token for email link
    const passwordSetToken = crypto.randomBytes(32).toString('hex');

    // ✅ Create new employee - ONLY saves to employees table
    const newEmployee = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      department: department.trim(),
      identityNumber: identityNumber?.trim() || undefined,
      phoneNumber: phoneNumber?.trim() || undefined,
      position: position?.trim() || undefined,
      hrId,
      // Add password-related fields to employee model if needed
      passwordSetToken,
      passwordSetExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isPasswordSet: false,
      isActive: true // New employees are active by default
    });

    console.log('✅ Employee created successfully:', newEmployee.name);

    let emailSent = false;

    // Send welcome email with password setup link
    try {
      console.log('📧 Attempting to send welcome email...');
      
      const emailContent = generateWelcomeEmail(
        newEmployee.name, 
        hrUser.department || 'Your Company',
        passwordSetToken
      );

      console.log('Email content generated, subject:', emailContent.subject);
      
      const emailResult = await sendEmail({
        to: newEmployee.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });

      if (emailResult) {
        emailSent = true;
        console.log('✅ Welcome email sent successfully to:', newEmployee.email);
      } else {
        console.error('❌ Failed to send welcome email to:', newEmployee.email);
      }
    } catch (emailError) {
      console.error('❌ Error sending welcome email:', emailError);
    }

    // Return the created employee without sensitive data
    const employeeResponse = {
      id: newEmployee._id,
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department,
      identityNumber: newEmployee.identityNumber,
      phoneNumber: newEmployee.phoneNumber,
      position: newEmployee.position,
      isPasswordSet: newEmployee.isPasswordSet,
      isActive: newEmployee.isActive,
      status: newEmployee.isActive ? 'active' : 'inactive', // Add status for frontend
      createdAt: newEmployee.createdAt,
      updatedAt: newEmployee.updatedAt
    };

    console.log('✅ Employee creation completed successfully');

    const message = emailSent 
      ? 'Employee created successfully and welcome email sent'
      : 'Employee created successfully, but welcome email failed to send';

    res.status(201).json({
      success: true,
      message,
      employee: employeeResponse,
      details: {
        welcomeEmailSent: emailSent
      }
    });

  } catch (error: any) {
    console.error('❌ Create employee error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists'
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

// Deactivate employee
export const deactivateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hrId = req.user?.hrId;

    console.log('Deactivate request - Employee ID:', id, 'HR ID:', hrId);

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - HR ID missing'
      });
    }

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    // Check if employee exists and belongs to this HR
    const employee = await Employee.findOne({ _id: id, hrId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update employee to inactive
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, select: '-hrId -passwordSetToken -password' }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee deactivated successfully:', updatedEmployee.email);

    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully',
      employee: {
        ...updatedEmployee.toObject(),
        status: 'inactive'
      }
    });

  } catch (error) {
    console.error('❌ Error deactivating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate employee'
    });
  }
};

// Reactivate employee
export const reactivateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hrId = req.user?.hrId;

    console.log('Reactivate request - Employee ID:', id, 'HR ID:', hrId);

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access - HR ID missing'
      });
    }

    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({
        success: false,
        message: 'Valid employee ID is required'
      });
    }

    // Check if employee exists and belongs to this HR
    const employee = await Employee.findOne({ _id: id, hrId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update employee to active
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true, select: '-hrId -passwordSetToken -password' }
    );

    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee reactivated successfully:', updatedEmployee.email);

    res.status(200).json({
      success: true,
      message: 'Employee reactivated successfully',
      employee: {
        ...updatedEmployee.toObject(),
        status: 'active'
      }
    });

  } catch (error) {
    console.error('❌ Error reactivating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate employee'
    });
  }
};

// Get a single employee by ID
export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hrId = req.user?.hrId;

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const employee = await Employee.findOne({ _id: id, hrId })
      .select('-hrId -passwordSetToken');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee retrieved successfully',
      employee: {
        ...employee.toObject(),
        status: employee.isActive ? 'active' : 'inactive'
      }
    });

  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update an employee
export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, department, identityNumber, phoneNumber, position } = req.body;
    const hrId = req.user?.hrId;

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Validate required fields
    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and department are required'
      });
    }

    // Check if employee exists and belongs to this HR
    const employee = await Employee.findOne({ _id: id, hrId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email.toLowerCase().trim() !== employee.email) {
      const existingEmployee = await Employee.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: id }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'An employee with this email already exists'
        });
      }
    }

    // Update employee
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        department: department.trim(),
        identityNumber: identityNumber?.trim() || undefined,
        phoneNumber: phoneNumber?.trim() || undefined,
        position: position?.trim() || undefined,
      },
      { new: true, runValidators: true }
    ).select('-hrId -passwordSetToken');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: {
        ...updatedEmployee!.toObject(),
        status: updatedEmployee!.isActive ? 'active' : 'inactive'
      }
    });

  } catch (error: any) {
    console.error('Update employee error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists'
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

// Delete an employee
export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const hrId = req.user?.hrId;

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Check if employee exists and belongs to this HR
    const employee = await Employee.findOne({ _id: id, hrId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // ✅ Delete only from employees table
    await Employee.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req: AuthRequest, res: Response) => {
  try {
    const hrId = req.user?.hrId;

    if (!hrId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    // Get total count
    const totalEmployees = await Employee.countDocuments({ hrId });

    // Get active/inactive counts
    const activeEmployees = await Employee.countDocuments({ hrId, isActive: true });
    const inactiveEmployees = await Employee.countDocuments({ hrId, isActive: false });

    // Get department-wise count
    const departmentStats = await Employee.aggregate([
      { $match: { hrId: hrId } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent employees (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentEmployees = await Employee.countDocuments({
      hrId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get position-wise count (if positions are available)
    const positionStats = await Employee.aggregate([
      { 
        $match: { 
          hrId: hrId, 
          position: { 
            $exists: true, 
            $nin: [null, '', undefined] 
          } 
        } 
      },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 } // Top 10 positions
    ]);

    res.status(200).json({
      success: true,
      message: 'Employee statistics retrieved successfully',
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        recentEmployees,
        departmentStats: departmentStats.map(stat => ({
          department: stat._id,
          count: stat.count
        })),
        positionStats: positionStats.map(stat => ({
          position: stat._id,
          count: stat.count
        }))
      }
    });

  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};