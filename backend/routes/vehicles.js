import express from 'express';
import { 
    createVehicle, 
    getAllVehicles, 
    getVehicleById, 
    updateVehicle, 
    deleteVehicle, 
    updateVehicleStatus, 
    getVehicleStats 
} from '../controllers/vehicleController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('Fleet Manager', 'Dispatcher'), createVehicle);
router.get('/', getAllVehicles);
router.get('/stats', getVehicleStats);
router.get('/:id', getVehicleById);
router.put('/:id', authorizeRoles('Fleet Manager', 'Dispatcher'), updateVehicle);
router.delete('/:id', authorizeRoles('Fleet Manager'), deleteVehicle);
router.put('/:id/status', authorizeRoles('Fleet Manager', 'Dispatcher'), updateVehicleStatus);

export default router;
