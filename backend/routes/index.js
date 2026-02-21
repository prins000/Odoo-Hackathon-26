import express from 'express';
import authRoutes from './auth.js';
import vehicleRoutes from './vehicles.js';
import driverRoutes from './drivers.js';
import tripRoutes from './trips.js';
import maintenanceRoutes from './maintenance.js';
import expenseRoutes from './expenses.js';
import fuelRoutes from './fuel.js';
import analyticsRoutes from './analytics.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/expenses', expenseRoutes);
router.use('/fuel', fuelRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'FleetFlow API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router;
