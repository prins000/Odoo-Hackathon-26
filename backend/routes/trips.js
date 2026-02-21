import express from 'express';
import { 
    createTrip, 
    getAllTrips, 
    getTripById, 
    updateTrip, 
    completeTrip, 
    cancelTrip, 
    updateTripTracking, 
    getTripStats 
} from '../controllers/tripController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('Dispatcher'), createTrip);
router.get('/', getAllTrips);
router.get('/stats', getTripStats);
router.get('/:id', getTripById);
router.put('/:id', authorizeRoles('Dispatcher'), updateTrip);
router.put('/:id/complete', authorizeRoles('Dispatcher'), completeTrip);
router.put('/:id/cancel', authorizeRoles('Dispatcher'), cancelTrip);
router.put('/:id/tracking', updateTripTracking);

export default router;
