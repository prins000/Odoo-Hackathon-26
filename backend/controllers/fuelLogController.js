import { FuelLog } from '../models/FuelLog.js';
import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../models/Driver.js';
import { Expense } from '../models/Expense.js';

export const createFuelLog = async (req, res) => {
    try {
        const fuelData = req.body;
        const { vehicle, driver, quantity, pricePerUnit } = fuelData;

        const vehicleDoc = await Vehicle.findById(vehicle);
        if (!vehicleDoc) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (driver) {
            const driverDoc = await Driver.findById(driver);
            if (!driverDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Driver not found'
                });
            }
        }

        const fuelId = `FL${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const lastFuelLog = await FuelLog.findOne({ vehicle })
            .sort({ date: -1 });

        if (lastFuelLog) {
            fuelData.previousOdometerReading = lastFuelLog.odometerReading;
        }

        const fuelLog = await FuelLog.create({
            ...fuelData,
            fuelId,
            createdBy: req.user.id
        });

        const expenseData = {
            expenseId: `EXP${Date.now()}${Math.floor(Math.random() * 1000)}`,
            type: 'Fuel',
            category: 'Operating',
            amount: fuelLog.totalAmount,
            date: fuelLog.date,
            description: `Fuel - ${fuelData.fuelType} - ${quantity} ${fuelData.unit}`,
            paymentMethod: fuelData.paymentMethod,
            vehicle,
            driver,
            vendor: fuelData.fuelStation,
            receipt: fuelData.receipt,
            createdBy: req.user.id,
            fuelDetails: fuelLog._id
        };

        const expense = await Expense.create(expenseData);

        await FuelLog.findByIdAndUpdate(fuelLog._id, { expense: expense._id });

        const createdFuelLog = await FuelLog.findById(fuelLog._id)
            .populate('vehicle', 'name licensePlate vehicleType')
            .populate('driver', 'name phone licenseNumber')
            .populate('expense', 'expenseId status amount')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Fuel log created successfully',
            data: createdFuelLog
        });
    } catch (error) {
        console.error('Create fuel log error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllFuelLogs = async (req, res) => {
    try {
        const { 
            vehicle, 
            driver, 
            fuelType, 
            paymentMethod,
            search,
            startDate,
            endDate 
        } = req.query;
        
        let filter = {};
        if (vehicle) filter.vehicle = vehicle;
        if (driver) filter.driver = driver;
        if (fuelType) filter.fuelType = fuelType;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        
        if (search) {
            filter.$or = [
                { fuelId: { $regex: search, $options: 'i' } },
                { 'fuelStation.name': { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const fuelLogs = await FuelLog.find(filter)
            .populate('vehicle', 'name licensePlate vehicleType')
            .populate('driver', 'name phone licenseNumber')
            .populate('expense', 'expenseId status amount')
            .populate('createdBy', 'name email')
            .sort({ date: -1 });

        res.json({
            success: true,
            data: fuelLogs
        });
    } catch (error) {
        console.error('Get fuel logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getFuelLogById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const fuelLog = await FuelLog.findById(id)
            .populate('vehicle', 'name licensePlate vehicleType odometer')
            .populate('driver', 'name phone licenseNumber')
            .populate('trip', 'tripId origin destination')
            .populate('expense', 'expenseId status amount totalAmount')
            .populate('createdBy', 'name email');

        if (!fuelLog) {
            return res.status(404).json({
                success: false,
                message: 'Fuel log not found'
            });
        }

        res.json({
            success: true,
            data: fuelLog
        });
    } catch (error) {
        console.error('Get fuel log error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateFuelLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const fuelLog = await FuelLog.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('vehicle', 'name licensePlate vehicleType')
         .populate('driver', 'name phone licenseNumber')
         .populate('expense', 'expenseId status amount')
         .populate('createdBy', 'name email');

        if (!fuelLog) {
            return res.status(404).json({
                success: false,
                message: 'Fuel log not found'
            });
        }

        if (fuelLog.expense) {
            await Expense.findByIdAndUpdate(fuelLog.expense._id, {
                amount: fuelLog.totalAmount,
                description: `Fuel - ${fuelLog.fuelType} - ${fuelLog.quantity} ${fuelLog.unit}`,
                vendor: fuelLog.fuelStation
            });
        }

        res.json({
            success: true,
            message: 'Fuel log updated successfully',
            data: fuelLog
        });
    } catch (error) {
        console.error('Update fuel log error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteFuelLog = async (req, res) => {
    try {
        const { id } = req.params;

        const fuelLog = await FuelLog.findByIdAndDelete(id);
        
        if (!fuelLog) {
            return res.status(404).json({
                success: false,
                message: 'Fuel log not found'
            });
        }

        if (fuelLog.expense) {
            await Expense.findByIdAndDelete(fuelLog.expense);
        }

        res.json({
            success: true,
            message: 'Fuel log deleted successfully'
        });
    } catch (error) {
        console.error('Delete fuel log error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getFuelEfficiency = async (req, res) => {
    try {
        const { vehicleId, startDate, endDate } = req.query;

        let filter = {};
        if (vehicleId) filter.vehicle = vehicleId;
        
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const fuelLogs = await FuelLog.find(filter)
            .populate('vehicle', 'name licensePlate vehicleType')
            .sort({ date: 1 });

        const efficiencyData = fuelLogs.map(log => ({
            date: log.date,
            vehicle: log.vehicle,
            odometerReading: log.odometerReading,
            quantity: log.quantity,
            distance: log.distanceSinceLastFuel,
            efficiency: log.fuelEfficiency,
            costPerKm: log.costPerKm,
            totalAmount: log.totalAmount
        })).filter(log => log.efficiency > 0);

        const overallStats = {
            totalDistance: efficiencyData.reduce((sum, log) => sum + (log.distance || 0), 0),
            totalFuel: efficiencyData.reduce((sum, log) => sum + log.quantity, 0),
            totalCost: efficiencyData.reduce((sum, log) => sum + log.totalAmount, 0),
            averageEfficiency: 0,
            averageCostPerKm: 0
        };

        if (overallStats.totalFuel > 0) {
            overallStats.averageEfficiency = overallStats.totalDistance / overallStats.totalFuel;
        }
        if (overallStats.totalDistance > 0) {
            overallStats.averageCostPerKm = overallStats.totalCost / overallStats.totalDistance;
        }

        res.json({
            success: true,
            data: {
                efficiencyData,
                overallStats
            }
        });
    } catch (error) {
        console.error('Get fuel efficiency error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getFuelStats = async (req, res) => {
    try {
        const { startDate, endDate, vehicleId } = req.query;
        
        let filter = {};
        if (vehicleId) filter.vehicle = vehicleId;
        
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const stats = await FuelLog.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        fuelType: '$fuelType',
                        paymentMethod: '$paymentMethod'
                    },
                    totalQuantity: { $sum: '$quantity' },
                    totalAmount: { $sum: '$totalAmount' },
                    totalDistance: { $sum: '$distanceSinceLastFuel' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const fuelTypeStats = {};
        const paymentMethodStats = {};
        let totalQuantity = 0;
        let totalAmount = 0;
        let totalDistance = 0;

        stats.forEach(stat => {
            const fuelKey = stat._id.fuelType;
            const paymentKey = stat._id.paymentMethod;

            if (!fuelTypeStats[fuelKey]) {
                fuelTypeStats[fuelKey] = { quantity: 0, amount: 0, distance: 0, count: 0 };
            }
            fuelTypeStats[fuelKey].quantity += stat.totalQuantity;
            fuelTypeStats[fuelKey].amount += stat.totalAmount;
            fuelTypeStats[fuelKey].distance += stat.totalDistance;
            fuelTypeStats[fuelKey].count += stat.count;

            if (!paymentMethodStats[paymentKey]) {
                paymentMethodStats[paymentKey] = { quantity: 0, amount: 0, count: 0 };
            }
            paymentMethodStats[paymentKey].quantity += stat.totalQuantity;
            paymentMethodStats[paymentKey].amount += stat.totalAmount;
            paymentMethodStats[paymentKey].count += stat.count;

            totalQuantity += stat.totalQuantity;
            totalAmount += stat.totalAmount;
            totalDistance += stat.totalDistance;
        });

        const averageEfficiency = totalQuantity > 0 ? totalDistance / totalQuantity : 0;
        const averageCostPerLiter = totalQuantity > 0 ? totalAmount / totalQuantity : 0;

        res.json({
            success: true,
            data: {
                totalFuelings: stats.reduce((sum, stat) => sum + stat.count, 0),
                totalQuantity,
                totalAmount,
                totalDistance,
                averageEfficiency: Math.round(averageEfficiency * 100) / 100,
                averageCostPerLiter: Math.round(averageCostPerLiter * 100) / 100,
                fuelTypeBreakdown: fuelTypeStats,
                paymentMethodBreakdown: paymentMethodStats
            }
        });
    } catch (error) {
        console.error('Get fuel stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getVehicleFuelHistory = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { limit = 50 } = req.query;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        const fuelLogs = await FuelLog.find({ vehicle: vehicleId })
            .populate('driver', 'name phone licenseNumber')
            .populate('createdBy', 'name email')
            .sort({ date: -1 })
            .limit(parseInt(limit));

        const totalFuel = fuelLogs.reduce((sum, log) => sum + log.quantity, 0);
        const totalCost = fuelLogs.reduce((sum, log) => sum + log.totalAmount, 0);
        const totalDistance = fuelLogs.reduce((sum, log) => sum + (log.distanceSinceLastFuel || 0), 0);

        res.json({
            success: true,
            data: {
                vehicle: {
                    id: vehicle._id,
                    name: vehicle.name,
                    licensePlate: vehicle.licensePlate,
                    vehicleType: vehicle.vehicleType,
                    currentOdometer: vehicle.odometer
                },
                fuelLogs,
                summary: {
                    totalFuelings: fuelLogs.length,
                    totalFuel,
                    totalCost,
                    totalDistance,
                    averageEfficiency: totalFuel > 0 ? totalDistance / totalFuel : 0,
                    averageCostPerLiter: totalFuel > 0 ? totalCost / totalFuel : 0
                }
            }
        });
    } catch (error) {
        console.error('Get vehicle fuel history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
