import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../models/Driver.js';

export const createVehicle = async (req, res) => {
    try {
        const vehicleData = req.body;
        
        const existingVehicle = await Vehicle.findOne({ licensePlate: vehicleData.licensePlate });
        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this license plate already exists'
            });
        }

        const vehicle = await Vehicle.create(vehicleData);
        
        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Create vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllVehicles = async (req, res) => {
    try {
        const { status, vehicleType, search } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (vehicleType) filter.vehicleType = vehicleType;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { licensePlate: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }

        const vehicles = await Vehicle.find(filter)
            .populate('currentDriver', 'name phone licenseNumber')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: vehicles
        });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getVehicleById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const vehicle = await Vehicle.findById(id)
            .populate('currentDriver', 'name phone licenseNumber email');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            data: vehicle
        });
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const vehicle = await Vehicle.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('currentDriver', 'name phone licenseNumber');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;

        const vehicle = await Vehicle.findByIdAndDelete(id);
        
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.currentDriver) {
            await Driver.findByIdAndUpdate(
                vehicle.currentDriver,
                { currentVehicle: null, status: 'Off Duty' }
            );
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully'
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateVehicleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, driverId } = req.body;

        const vehicle = await Vehicle.findById(id);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (status === 'On Trip' && !driverId) {
            return res.status(400).json({
                success: false,
                message: 'Driver ID is required when assigning vehicle to trip'
            });
        }

        if (status === 'Available' && vehicle.currentDriver) {
            await Driver.findByIdAndUpdate(
                vehicle.currentDriver,
                { currentVehicle: null, status: 'Off Duty' }
            );
        }

        if (status === 'On Trip' && driverId) {
            await Driver.findByIdAndUpdate(
                driverId,
                { currentVehicle: id, status: 'On Duty' }
            );
        }

        vehicle.status = status;
        if (driverId) {
            vehicle.currentDriver = driverId;
        } else if (status === 'Available') {
            vehicle.currentDriver = null;
        }

        await vehicle.save();

        const updatedVehicle = await Vehicle.findById(id)
            .populate('currentDriver', 'name phone licenseNumber');

        res.json({
            success: true,
            message: 'Vehicle status updated successfully',
            data: updatedVehicle
        });
    } catch (error) {
        console.error('Update vehicle status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getVehicleStats = async (req, res) => {
    try {
        const stats = await Vehicle.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = {};
        stats.forEach(stat => {
            statusStats[stat._id] = stat.count;
        });

        const totalVehicles = await Vehicle.countDocuments();
        const activeVehicles = statusStats['On Trip'] || 0;
        const availableVehicles = statusStats['Available'] || 0;
        const inShopVehicles = statusStats['In Shop'] || 0;
        const outOfServiceVehicles = statusStats['Out of Service'] || 0;

        const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

        res.json({
            success: true,
            data: {
                totalVehicles,
                activeVehicles,
                availableVehicles,
                inShopVehicles,
                outOfServiceVehicles,
                utilizationRate: Math.round(utilizationRate * 100) / 100
            }
        });
    } catch (error) {
        console.error('Get vehicle stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
