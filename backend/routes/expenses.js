import express from 'express';
import { 
    createExpense, 
    getAllExpenses, 
    getExpenseById, 
    updateExpense, 
    deleteExpense, 
    approveExpense, 
    rejectExpense, 
    markExpenseAsPaid, 
    getExpenseStats, 
    getVehicleExpenses 
} from '../controllers/expenseController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('Financial Analyst'), createExpense);
router.get('/', getAllExpenses);
router.get('/stats', getExpenseStats);
router.get('/vehicle/:vehicleId', getVehicleExpenses);
router.get('/:id', getExpenseById);
router.put('/:id', authorizeRoles('Financial Analyst'), updateExpense);
router.delete('/:id', authorizeRoles('Financial Analyst'), deleteExpense);
router.put('/:id/approve', authorizeRoles('Financial Analyst'), approveExpense);
router.put('/:id/reject', authorizeRoles('Financial Analyst'), rejectExpense);
router.put('/:id/pay', authorizeRoles('Financial Analyst'), markExpenseAsPaid);

export default router;
