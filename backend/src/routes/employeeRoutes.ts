import express from 'express'
import {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
  deactivateEmployee,
  reactivateEmployee
} from '../controllers/employeeController'
import { authenticateHRToken } from '../middleware/hrAuthMiddleware';

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateHRToken);

// Employee CRUD routes
router.get('/', getAllEmployees)
router.post('/', createEmployee)
router.get('/stats', getEmployeeStats)
router.get('/:id', getEmployeeById)
router.put('/:id', updateEmployee)
router.delete('/:id', deleteEmployee)

// Employee activation/deactivation routes
router.put('/:id/deactivate', deactivateEmployee)
router.put('/:id/reactivate', reactivateEmployee)

export default router