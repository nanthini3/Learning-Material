// Add this to your routes (you can create a new file or add to existing routes)
// src/routes/debug.ts

import express from 'express';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Debug route to test token authentication
router.get('/token-test', authMiddleware, (req: any, res) => {
  console.log('=== TOKEN DEBUG ROUTE ===');
  console.log('User from request:', req.user);
  
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

export default router;