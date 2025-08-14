// src/server.ts
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import multer from 'multer'
import { connectDB } from './config/db'
import { migrateExistingModules } from './models/ModuleModel'
import hrRoutes from './routes/hrAuthRoutes'
import employeeRoutes from './routes/employeeRoutes'
import employeeAuthRoutes from './routes/employeeAuthRoutes'
import moduleRoutes from './routes/moduleRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (profile images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Connect to database and run migration
const initializeServer = async () => {
  try {
    await connectDB();
    
    // Run migration for existing modules
    console.log('🔄 Running module migration...');
    await migrateExistingModules();
    console.log('✅ Database migration completed');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
  }
};

initializeServer();

// Debug route to test server
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' })
})

// Debug route to test hr routes
app.get('/api/hr/test', (req, res) => {
  res.json({ message: 'HR routes are working!' })
})

// Debug route to test user routes
app.get('/api/user/test', (req, res) => {
  res.json({ message: 'User routes are working!' })
})

// Debug route to test employee routes
app.get('/api/employee/test', (req, res) => {
  res.json({ message: 'Employee routes are working!' })
})

// Debug route to test module routes
app.get('/api/hr/modules/test', (req, res) => {
  res.json({ message: 'Module routes are working!' })
})

// Routes
app.use('/api/hr', hrRoutes)
app.use('/api/hr/employees', employeeRoutes)
app.use('/api/hr/modules', moduleRoutes) // HR module routes
app.use('/api/modules', moduleRoutes) // Employee module access
app.use('/api/employee', employeeAuthRoutes)

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error occurred:', error)

  // Handle multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File too large. Maximum size is 5MB.' 
      })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        message: 'Unexpected file field.' 
      })
    }
  }

  // Handle custom file filter errors
  if (error.message === 'Not an image! Please upload an image file.') {
    return res.status(400).json({ 
      success: false,
      message: 'Only image files are allowed.' 
    })
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token.' 
    })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false,
      message: 'Token expired.' 
    })
  }

  // Generic error response
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!' 
  })
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app