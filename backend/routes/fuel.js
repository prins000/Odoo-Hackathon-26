import express from 'express';
import { 
    createFuelLog, 
    getAllFuelLogs, 
    getFuelLogById, 
    updateFuelLog, 
    deleteFuelLog, 
    getFuelEfficiency, 
    getFuelStats, 
    getVehicleFuelHistory 
} from '../controllers/fuelLogController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('Fleet Manager', 'Dispatcher', 'Driver'), createFuelLog);
router.get('/', getAllFuelLogs);
router.get('/efficiency', getFuelEfficiency);
router.get('/stats', getFuelStats);
router.get('/vehicle/:vehicleId', getVehicleFuelHistory);
router.get('/:id', getFuelLogById);
router.put('/:id', authorizeRoles('Fleet Manager', 'Dispatcher', 'Driver'), updateFuelLog);
router.delete('/:id', authorizeRoles('Fleet Manager', 'Financial Analyst'), deleteFuelLog);

export default router;
