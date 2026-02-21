import { Maintenance } from '../models/Maintenance.js';
import { Vehicle } from '../models/Vehicle.js';
import { User } from '../models/User.js';

export const createMaintenance = async (req, res) => {
    try {
        const maintenanceData = req.body;
        const { vehicle } = maintenanceData;

        const vehicleDoc = await Vehicle.findById(vehicle);
        if (!vehicleDoc) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicleDoc.status === 'On Trip') {
            return res.status(400).json({
                success: false,
                message: 'Cannot schedule maintenance for vehicle that is currently on trip'
            });
        }

        const maintenanceId = `MNT${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const workOrderNumber = `WO${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const maintenance = await Maintenance.create({
            ...maintenanceData,
            maintenanceId,
            'workOrder.workOrderNumber': workOrderNumber,
            'workOrder.issuedBy': req.user.id,
            odometerAtService: vehicleDoc.odometer
        });

        if (maintenanceData.scheduledDate && new Date(maintenanceData.scheduledDate) <= new Date()) {
            await Vehicle.findByIdAndUpdate(vehicle, {
                status: 'In Shop'
            });
        }

        const createdMaintenance = await Maintenance.findById(maintenance._id)
            .populate('vehicle', 'name licensePlate vehicleType odometer')
            .populate('workOrder.issuedBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Maintenance scheduled successfully',
            data: createdMaintenance
        });
    } catch (error) {
        console.error('Create maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllMaintenance = async (req, res) => {
    try {
        const { status, type, vehicle, priority, search } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (vehicle) filter.vehicle = vehicle;
        if (priority) filter.priority = priority;
        if (search) {
            filter.$or = [
                { maintenanceId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'workOrder.workOrderNumber': { $regex: search, $options: 'i' } }
            ];
        }

        const maintenance = await Maintenance.find(filter)
            .populate('vehicle', 'name licensePlate vehicleType status')
            .populate('workOrder.issuedBy', 'name email')
            .sort({ scheduledDate: -1 });

        res.json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const maintenance = await Maintenance.findById(id)
            .populate('vehicle', 'name licensePlate vehicleType odometer status')
            .populate('workOrder.issuedBy', 'name email');

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        res.json({
            success: true,
            data: maintenance
        });
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const maintenance = await Maintenance.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('vehicle', 'name licensePlate vehicleType status')
         .populate('workOrder.issuedBy', 'name email');

        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        res.json({
            success: true,
            message: 'Maintenance updated successfully',
            data: maintenance
        });
    } catch (error) {
        console.error('Update maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const startMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await Maintenance.findById(id).populate('vehicle');
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        if (maintenance.status !== 'Scheduled') {
            return res.status(400).json({
                success: false,
                message: 'Maintenance cannot be started in current status'
            });
        }

        await Maintenance.findByIdAndUpdate(id, {
            status: 'In Progress',
            startDate: new Date()
        });

        await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
            status: 'In Shop'
        });

        res.json({
            success: true,
            message: 'Maintenance started successfully'
        });
    } catch (error) {
        console.error('Start maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const completeMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const { completionDate, actualDuration, odometerReading, nextServiceDue, nextServiceOdometer } = req.body;

        const maintenance = await Maintenance.findById(id).populate('vehicle');
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        if (maintenance.status !== 'In Progress') {
            return res.status(400).json({
                success: false,
                message: 'Maintenance cannot be completed in current status'
            });
        }

        const updateData = {
            status: 'Completed',
            completionDate: completionDate || new Date()
        };

        if (actualDuration) updateData.actualDuration = actualDuration;
        if (odometerReading) updateData.odometerAtService = odometerReading;
        if (nextServiceDue) updateData.nextServiceDue = nextServiceDue;
        if (nextServiceOdometer) updateData.nextServiceOdometer = nextServiceOdometer;

        await Maintenance.findByIdAndUpdate(id, updateData);

        await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
            status: 'Available',
            odometer: odometerReading || maintenance.vehicle.odometer,
            lastMaintenanceDate: completionDate || new Date(),
            nextMaintenanceDue: nextServiceDue,
            nextServiceOdometer: nextServiceOdometer
        });

        res.json({
            success: true,
            message: 'Maintenance completed successfully'
        });
    } catch (error) {
        console.error('Complete maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const cancelMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await Maintenance.findById(id).populate('vehicle');
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance record not found'
            });
        }

        if (maintenance.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed maintenance'
            });
        }

        await Maintenance.findByIdAndUpdate(id, {
            status: 'Cancelled'
        });

        if (maintenance.vehicle.status === 'In Shop' && maintenance.status !== 'In Progress') {
            await Vehicle.findByIdAndUpdate(maintenance.vehicle._id, {
                status: 'Available'
            });
        }

        res.json({
            success: true,
            message: 'Maintenance cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getMaintenanceStats = async (req, res) => {
    try {
        const stats = await Maintenance.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalCost: { 
                        $sum: { $add: ['$cost.parts', '$cost.labor', '$cost.other'] }
                    }
                }
            }
        ]);

        const statusStats = {};
        let totalCost = 0;

        stats.forEach(stat => {
            statusStats[stat._id] = {
                count: stat.count,
                cost: stat.totalCost
            };
            totalCost += stat.totalCost;
        });

        const totalMaintenance = await Maintenance.countDocuments();
        const scheduledMaintenance = statusStats['Scheduled']?.count || 0;
        const inProgressMaintenance = statusStats['In Progress']?.count || 0;
        const completedMaintenance = statusStats['Completed']?.count || 0;

        const overdueMaintenance = await Maintenance.countDocuments({
            status: 'Scheduled',
            scheduledDate: { $lt: new Date() }
        });

        res.json({
            success: true,
            data: {
                totalMaintenance,
                scheduledMaintenance,
                inProgressMaintenance,
                completedMaintenance,
                overdueMaintenance,
                totalCost,
                statusBreakdown: statusStats
            }
        });
    } catch (error) {
        console.error('Get maintenance stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getUpcomingMaintenance = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + parseInt(days));

        const upcomingMaintenance = await Maintenance.find({
            status: 'Scheduled',
            scheduledDate: { 
                $gte: new Date(),
                $lte: cutoffDate
            }
        })
        .populate('vehicle', 'name licensePlate vehicleType odometer')
        .populate('workOrder.issuedBy', 'name email')
        .sort({ scheduledDate: 1 });

        res.json({
            success: true,
            data: upcomingMaintenance
        });
    } catch (error) {
        console.error('Get upcoming maintenance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
