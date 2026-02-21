import express from 'express';
import { 
    createDriver, 
    getAllDrivers, 
    getDriverById, 
    updateDriver, 
    deleteDriver, 
    updateDriverStatus, 
    getDriverCompliance, 
    updateDriverPerformance 
} from '../controllers/driverController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('Fleet Manager', 'Safety Officer'), createDriver);
router.get('/', getAllDrivers);
router.get('/compliance', getDriverCompliance);
router.get('/:id', getDriverById);
router.put('/:id', authorizeRoles('Fleet Manager', 'Safety Officer'), updateDriver);
router.delete('/:id', authorizeRoles('Fleet Manager'), deleteDriver);
router.put('/:id/status', authorizeRoles('Fleet Manager', 'Dispatcher'), updateDriverStatus);
router.put('/:id/performance', authorizeRoles('Fleet Manager', 'Safety Officer'), updateDriverPerformance);

export default router;
