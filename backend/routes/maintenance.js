import express from 'express';
import { 
    createMaintenance, 
    getAllMaintenance, 
    getMaintenanceById, 
    updateMaintenance, 
    startMaintenance, 
    completeMaintenance, 
    cancelMaintenance, 
    getMaintenanceStats, 
    getUpcomingMaintenance 
} from '../controllers/maintenanceController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('Fleet Manager', 'Dispatcher'), createMaintenance);
router.get('/', getAllMaintenance);
router.get('/stats', getMaintenanceStats);
router.get('/upcoming', getUpcomingMaintenance);
router.get('/:id', getMaintenanceById);
router.put('/:id', authorizeRoles('Fleet Manager', 'Dispatcher'), updateMaintenance);
router.put('/:id/start', authorizeRoles('Fleet Manager', 'Dispatcher'), startMaintenance);
router.put('/:id/complete', authorizeRoles('Fleet Manager', 'Dispatcher'), completeMaintenance);
router.put('/:id/cancel', authorizeRoles('Fleet Manager', 'Dispatcher'), cancelMaintenance);

export default router;
