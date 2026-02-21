import { Trip } from '../models/Trip.js';
import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../models/Driver.js';
import { User } from '../models/User.js';

export const createTrip = async (req, res) => {
    try {
        const tripData = req.body;
        const { vehicle, driver, cargoWeight } = tripData;

        const vehicleDoc = await Vehicle.findById(vehicle);
        if (!vehicleDoc) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicleDoc.status !== 'Available') {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not available for assignment'
            });
        }

        if (cargoWeight > vehicleDoc.maxLoadCapacity) {
            return res.status(400).json({
                success: false,
                message: `Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${vehicleDoc.maxLoadCapacity}kg)`
            });
        }

        const driverDoc = await Driver.findById(driver);
        if (!driverDoc) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driverDoc.licenseExpiry <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Driver license has expired'
            });
        }

        if (driverDoc.status !== 'Off Duty') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not available for assignment'
            });
        }

        const tripId = `TRP${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        const trip = await Trip.create({
            ...tripData,
            tripId,
            startOdometer: vehicleDoc.odometer,
            dispatcher: req.user.id
        });

        await Vehicle.findByIdAndUpdate(vehicle, {
            status: 'On Trip',
            currentDriver: driver
        });

        await Driver.findByIdAndUpdate(driver, {
            status: 'On Duty',
            currentVehicle: vehicle,
            totalTrips: driverDoc.totalTrips + 1
        });

        const createdTrip = await Trip.findById(trip._id)
            .populate('vehicle', 'name licensePlate vehicleType')
            .populate('driver', 'name phone licenseNumber')
            .populate('dispatcher', 'name email');

        res.status(201).json({
            success: true,
            message: 'Trip created successfully',
            data: createdTrip
        });
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllTrips = async (req, res) => {
    try {
        const { status, priority, vehicle, driver, search } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (vehicle) filter.vehicle = vehicle;
        if (driver) filter.driver = driver;
        if (search) {
            filter.$or = [
                { tripId: { $regex: search, $options: 'i' } },
                { origin: { $regex: search, $options: 'i' } },
                { destination: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } }
            ];
        }

        const trips = await Trip.find(filter)
            .populate('vehicle', 'name licensePlate vehicleType status')
            .populate('driver', 'name phone licenseNumber')
            .populate('dispatcher', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: trips
        });
    } catch (error) {
        console.error('Get trips error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const trip = await Trip.findById(id)
            .populate('vehicle', 'name licensePlate vehicleType status odometer')
            .populate('driver', 'name phone licenseNumber email')
            .populate('dispatcher', 'name email');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.json({
            success: true,
            data: trip
        });
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const trip = await Trip.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('vehicle', 'name licensePlate vehicleType status')
         .populate('driver', 'name phone licenseNumber')
         .populate('dispatcher', 'name email');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        res.json({
            success: true,
            message: 'Trip updated successfully',
            data: trip
        });
    } catch (error) {
        console.error('Update trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const completeTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { endOdometer, notes, actualCost } = req.body;

        const trip = await Trip.findById(id)
            .populate('vehicle')
            .populate('driver');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        if (trip.status !== 'Dispatched' && trip.status !== 'In Transit') {
            return res.status(400).json({
                success: false,
                message: 'Trip cannot be completed in current status'
            });
        }

        if (!endOdometer || endOdometer < trip.startOdometer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid odometer reading'
            });
        }

        const actualDuration = (new Date() - trip.startDate) / (1000 * 60 * 60);

        await Trip.findByIdAndUpdate(id, {
            status: 'Completed',
            endDate: new Date(),
            endOdometer,
            actualDuration,
            actualCost: actualCost || trip.estimatedCost,
            notes: notes || trip.notes
        });

        await Vehicle.findByIdAndUpdate(trip.vehicle._id, {
            status: 'Available',
            currentDriver: null,
            odometer: endOdometer
        });

        await Driver.findByIdAndUpdate(trip.driver._id, {
            status: 'Off Duty',
            currentVehicle: null,
            completedTrips: trip.driver.completedTrips + 1
        });

        const completedTrip = await Trip.findById(id)
            .populate('vehicle', 'name licensePlate vehicleType')
            .populate('driver', 'name phone licenseNumber')
            .populate('dispatcher', 'name email');

        res.json({
            success: true,
            message: 'Trip completed successfully',
            data: completedTrip
        });
    } catch (error) {
        console.error('Complete trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const cancelTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const trip = await Trip.findById(id)
            .populate('vehicle')
            .populate('driver');

        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        if (trip.status === 'Completed' || trip.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Trip cannot be cancelled in current status'
            });
        }

        await Trip.findByIdAndUpdate(id, {
            status: 'Cancelled',
            cancellationReason: cancellationReason || 'Trip cancelled by dispatcher'
        });

        if (trip.vehicle.status === 'On Trip') {
            await Vehicle.findByIdAndUpdate(trip.vehicle._id, {
                status: 'Available',
                currentDriver: null
            });
        }

        if (trip.driver.status === 'On Duty') {
            await Driver.findByIdAndUpdate(trip.driver._id, {
                status: 'Off Duty',
                currentVehicle: null
            });
        }

        res.json({
            success: true,
            message: 'Trip cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel trip error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateTripTracking = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentLocation, weatherConditions, roadConditions } = req.body;

        const trip = await Trip.findById(id);
        if (!trip) {
            return res.status(404).json({
                success: false,
                message: 'Trip not found'
            });
        }

        const updateData = {
            'tracking.currentLocation': currentLocation,
            'tracking.lastUpdate': new Date()
        };

        if (weatherConditions) updateData.weatherConditions = weatherConditions;
        if (roadConditions) updateData.roadConditions = roadConditions;

        await Trip.findByIdAndUpdate(id, updateData);

        res.json({
            success: true,
            message: 'Trip tracking updated successfully'
        });
    } catch (error) {
        console.error('Update trip tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getTripStats = async (req, res) => {
    try {
        const stats = await Trip.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$revenue' },
                    totalCost: { $sum: '$actualCost' }
                }
            }
        ]);

        const statusStats = {};
        let totalRevenue = 0;
        let totalCost = 0;

        stats.forEach(stat => {
            statusStats[stat._id] = {
                count: stat.count,
                revenue: stat.totalRevenue,
                cost: stat.totalCost
            };
            totalRevenue += stat.totalRevenue;
            totalCost += stat.totalCost;
        });

        const totalTrips = await Trip.countDocuments();
        const completedTrips = statusStats['Completed']?.count || 0;
        const activeTrips = (statusStats['Dispatched']?.count || 0) + (statusStats['In Transit']?.count || 0);
        const pendingTrips = statusStats['Draft']?.count || 0;

        const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
        const totalProfit = totalRevenue - totalCost;

        res.json({
            success: true,
            data: {
                totalTrips,
                completedTrips,
                activeTrips,
                pendingTrips,
                completionRate: Math.round(completionRate * 100) / 100,
                totalRevenue,
                totalCost,
                totalProfit,
                statusBreakdown: statusStats
            }
        });
    } catch (error) {
        console.error('Get trip stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
