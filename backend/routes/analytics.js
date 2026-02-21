import express from 'express';
import { 
    getDashboardStats, 
    getVehiclePerformance, 
    getDriverPerformance, 
    getFinancialReports, 
    getComplianceReport 
} from '../controllers/analyticsController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/dashboard', getDashboardStats);
router.get('/vehicle-performance', getVehiclePerformance);
router.get('/driver-performance', getDriverPerformance);
router.get('/financial-reports', authorizeRoles('Financial Analyst'), getFinancialReports);
router.get('/compliance', authorizeRoles('Safety Officer'), getComplianceReport);

export default router;
