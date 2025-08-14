// src/routes/moduleRoutes.ts
import express from 'express'
import {
  getAllModules,
  createModule,
  getModuleById,
  updateModule,
  updateModuleStatus,
  deleteModule,
  getModuleStats,
  getPublishedModulesForEmployee
} from '../controllers/moduleController'
import { authenticateHRToken } from '../middleware/hrAuthMiddleware'

const router = express.Router()

// Test route to verify routes are working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Module routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Debug route to test without auth
router.post('/debug', (req, res) => {
  console.log('Debug route hit with body:', req.body);
  res.json({ 
    message: 'Debug route working', 
    receivedData: req.body,
    headers: req.headers.authorization ? 'Auth header present' : 'No auth header'
  });
});

// Employee route - GET published modules (no auth for now to test)
router.get('/employee', getPublishedModulesForEmployee);

// HR Routes (all require authentication)
router.get('/', authenticateHRToken, getAllModules)
router.post('/', authenticateHRToken, createModule)
router.get('/stats', authenticateHRToken, getModuleStats)
router.get('/:id', authenticateHRToken, getModuleById)
router.put('/:id', authenticateHRToken, updateModule)
router.patch('/:id/status', authenticateHRToken, updateModuleStatus)
router.delete('/:id', authenticateHRToken, deleteModule)

export default router