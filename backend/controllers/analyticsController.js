import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../models/Driver.js';
import { Trip } from '../models/Trip.js';
import { Maintenance } from '../models/Maintenance.js';
import { Expense } from '../models/Expense.js';
import { FuelLog } from '../models/FuelLog.js';

export const getDashboardStats = async (req, res) => {
    try {
        const totalVehicles = await Vehicle.countDocuments({ isActive: true });
        const activeVehicles = await Vehicle.countDocuments({ status: 'On Trip', isActive: true });
        const availableVehicles = await Vehicle.countDocuments({ status: 'Available', isActive: true });
        const inShopVehicles = await Vehicle.countDocuments({ status: 'In Shop', isActive: true });
        const outOfServiceVehicles = await Vehicle.countDocuments({ status: 'Out of Service', isActive: true });

        const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

        const totalDrivers = await Driver.countDocuments({ isActive: true });
        const onDutyDrivers = await Driver.countDocuments({ status: 'On Duty', isActive: true });
        const offDutyDrivers = await Driver.countDocuments({ status: 'Off Duty', isActive: true });
        const suspendedDrivers = await Driver.countDocuments({ status: 'Suspended', isActive: true });

        const totalTrips = await Trip.countDocuments();
        const completedTrips = await Trip.countDocuments({ status: 'Completed' });
        const activeTrips = await Trip.countDocuments({ status: { $in: ['Dispatched', 'In Transit'] } });
        const pendingTrips = await Trip.countDocuments({ status: 'Draft' });

        const tripCompletionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

        const totalMaintenance = await Maintenance.countDocuments();
        const scheduledMaintenance = await Maintenance.countDocuments({ status: 'Scheduled' });
        const inProgressMaintenance = await Maintenance.countDocuments({ status: 'In Progress' });
        const completedMaintenance = await Maintenance.countDocuments({ status: 'Completed' });

        const overdueMaintenance = await Maintenance.countDocuments({
            status: 'Scheduled',
            scheduledDate: { $lt: new Date() }
        });

        const expenseAggregation = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: '$amount' },
                    totalTax: { $sum: '$tax.totalTax' },
                    fuelExpenses: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'Fuel'] }, '$amount', 0]
                        }
                    },
                    maintenanceExpenses: {
                        $sum: {
                            $cond: [{ $eq: ['$type', 'Maintenance'] }, '$amount', 0]
                        }
                    }
                }
            }
        ]);

        const expenseData = expenseAggregation[0] || {
            totalExpenses: 0,
            totalTax: 0,
            fuelExpenses: 0,
            maintenanceExpenses: 0
        };

        const fuelAggregation = await FuelLog.aggregate([
            {
                $group: {
                    _id: null,
                    totalFuel: { $sum: '$quantity' },
                    totalFuelCost: { $sum: '$totalAmount' },
                    totalDistance: { $sum: '$distanceSinceLastFuel' }
                }
            }
        ]);

        const fuelData = fuelAggregation[0] || {
            totalFuel: 0,
            totalFuelCost: 0,
            totalDistance: 0
        };

        const fuelEfficiency = fuelData.totalFuel > 0 ? fuelData.totalDistance / fuelData.totalFuel : 0;

        const revenueAggregation = await Trip.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$revenue' },
                    totalCost: { $sum: '$actualCost' }
                }
            }
        ]);

        const revenueData = revenueAggregation[0] || {
            totalRevenue: 0,
            totalCost: 0
        };

        const totalProfit = revenueData.totalRevenue - revenueData.totalCost;

        res.json({
            success: true,
            data: {
                fleet: {
                    totalVehicles,
                    activeVehicles,
                    availableVehicles,
                    inShopVehicles,
                    outOfServiceVehicles,
                    utilizationRate: Math.round(utilizationRate * 100) / 100
                },
                drivers: {
                    totalDrivers,
                    onDutyDrivers,
                    offDutyDrivers,
                    suspendedDrivers
                },
                trips: {
                    totalTrips,
                    completedTrips,
                    activeTrips,
                    pendingTrips,
                    completionRate: Math.round(tripCompletionRate * 100) / 100
                },
                maintenance: {
                    totalMaintenance,
                    scheduledMaintenance,
                    inProgressMaintenance,
                    completedMaintenance,
                    overdueMaintenance
                },
                finances: {
                    totalExpenses: expenseData.totalExpenses,
                    totalTax: expenseData.totalTax,
                    fuelExpenses: expenseData.fuelExpenses,
                    maintenanceExpenses: expenseData.maintenanceExpenses,
                    totalRevenue: revenueData.totalRevenue,
                    totalCost: revenueData.totalCost,
                    totalProfit
                },
                fuel: {
                    totalFuel: fuelData.totalFuel,
                    totalFuelCost: fuelData.totalFuelCost,
                    totalDistance: fuelData.totalDistance,
                    averageEfficiency: Math.round(fuelEfficiency * 100) / 100
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getVehiclePerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const vehicles = await Vehicle.find({ isActive: true }).lean();

        const performanceData = await Promise.all(vehicles.map(async (vehicle) => {
            const trips = await Trip.find({ 
                vehicle: vehicle._id, 
                status: 'Completed',
                ...dateFilter
            });

            const expenses = await Expense.find({ 
                vehicle: vehicle._id,
                ...dateFilter
            });

            const fuelLogs = await FuelLog.find({ 
                vehicle: vehicle._id,
                ...dateFilter
            });

            const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
            const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
            const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
            const totalFuel = fuelLogs.reduce((sum, log) => sum + log.quantity, 0);

            const roi = vehicle.acquisitionCost > 0 ? 
                ((totalRevenue - totalExpenses) / vehicle.acquisitionCost) * 100 : 0;

            const fuelEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;
            const costPerKm = totalDistance > 0 ? totalExpenses / totalDistance : 0;

            return {
                vehicle: {
                    id: vehicle._id,
                    name: vehicle.name,
                    licensePlate: vehicle.licensePlate,
                    vehicleType: vehicle.vehicleType,
                    acquisitionCost: vehicle.acquisitionCost
                },
                performance: {
                    totalTrips: trips.length,
                    totalRevenue,
                    totalExpenses,
                    totalDistance,
                    totalFuel,
                    roi: Math.round(roi * 100) / 100,
                    fuelEfficiency: Math.round(fuelEfficiency * 100) / 100,
                    costPerKm: Math.round(costPerKm * 100) / 100,
                    profit: totalRevenue - totalExpenses
                }
            };
        }));

        res.json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        console.error('Get vehicle performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getDriverPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.startDate = {};
            if (startDate) dateFilter.startDate.$gte = new Date(startDate);
            if (endDate) dateFilter.startDate.$lte = new Date(endDate);
        }

        const drivers = await Driver.find({ isActive: true }).lean();

        const performanceData = await Promise.all(drivers.map(async (driver) => {
            const trips = await Trip.find({ 
                driver: driver._id, 
                status: 'Completed',
                ...dateFilter
            });

            const totalTrips = await Trip.countDocuments({ driver: driver._id });
            const completedTrips = await Trip.countDocuments({ 
                driver: driver._id, 
                status: 'Completed' 
            });

            const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
            const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);

            const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;

            return {
                driver: {
                    id: driver._id,
                    name: driver.name,
                    licenseNumber: driver.licenseNumber,
                    status: driver.status
                },
                performance: {
                    totalTrips,
                    completedTrips,
                    completionRate: Math.round(completionRate * 100) / 100,
                    safetyScore: driver.safetyScore,
                    violations: driver.violations,
                    accidents: driver.accidents,
                    totalRevenue,
                    totalDistance,
                    averageRevenuePerTrip: completedTrips > 0 ? totalRevenue / completedTrips : 0
                }
            };
        }));

        res.json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        console.error('Get driver performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getFinancialReports = async (req, res) => {
    try {
        const { startDate, endDate, reportType = 'monthly' } = req.query;

        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(dateFilter);
        const trips = await Trip.find({ status: 'Completed', ...dateFilter });

        const monthlyData = {};
        const categoryData = {};

        expenses.forEach(expense => {
            const month = new Date(expense.date).toISOString().slice(0, 7);
            const category = expense.category;

            if (!monthlyData[month]) {
                monthlyData[month] = { expenses: 0, revenue: 0, profit: 0 };
            }
            if (!categoryData[category]) {
                categoryData[category] = 0;
            }

            monthlyData[month].expenses += expense.totalAmount;
            categoryData[category] += expense.totalAmount;
        });

        trips.forEach(trip => {
            const month = new Date(trip.endDate || trip.startDate).toISOString().slice(0, 7);

            if (!monthlyData[month]) {
                monthlyData[month] = { expenses: 0, revenue: 0, profit: 0 };
            }

            monthlyData[month].revenue += trip.revenue;
        });

        Object.keys(monthlyData).forEach(month => {
            monthlyData[month].profit = monthlyData[month].revenue - monthlyData[month].expenses;
        });

        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
        const totalRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
        const totalProfit = totalRevenue - totalExpenses;

        res.json({
            success: true,
            data: {
                summary: {
                    totalExpenses,
                    totalRevenue,
                    totalProfit,
                    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
                },
                monthlyBreakdown: monthlyData,
                categoryBreakdown: categoryData
            }
        });
    } catch (error) {
        console.error('Get financial reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getComplianceReport = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

        const vehicles = await Vehicle.find({ isActive: true });
        const drivers = await Driver.find({ isActive: true });

        const vehicleCompliance = vehicles.map(vehicle => {
            const isInsuranceExpired = vehicle.insuranceExpiry <= today;
            const isRegistrationExpired = vehicle.registrationExpiry <= today;
            const isInsuranceExpiringSoon = vehicle.insuranceExpiry <= thirtyDaysFromNow && vehicle.insuranceExpiry > today;
            const isRegistrationExpiringSoon = vehicle.registrationExpiry <= thirtyDaysFromNow && vehicle.registrationExpiry > today;

            return {
                id: vehicle._id,
                name: vehicle.name,
                licensePlate: vehicle.licensePlate,
                status: vehicle.status,
                compliance: {
                    insurance: {
                        isValid: !isInsuranceExpired,
                        expiryDate: vehicle.insuranceExpiry,
                        isExpiringSoon: isInsuranceExpiringSoon
                    },
                    registration: {
                        isValid: !isRegistrationExpired,
                        expiryDate: vehicle.registrationExpiry,
                        isExpiringSoon: isRegistrationExpiringSoon
                    }
                },
                overallCompliance: !isInsuranceExpired && !isRegistrationExpired
            };
        });

        const driverCompliance = drivers.map(driver => {
            const isLicenseExpired = driver.licenseExpiry <= today;
            const isLicenseExpiringSoon = driver.licenseExpiry <= thirtyDaysFromNow && driver.licenseExpiry > today;
            const isMedicalExpired = driver.medicalCertificateExpiry <= today;
            const isMedicalExpiringSoon = driver.medicalCertificateExpiry <= thirtyDaysFromNow && driver.medicalCertificateExpiry > today;
            const isTrainingDue = driver.nextTrainingDue && driver.nextTrainingDue <= today;

            return {
                id: driver._id,
                name: driver.name,
                licenseNumber: driver.licenseNumber,
                status: driver.status,
                compliance: {
                    license: {
                        isValid: !isLicenseExpired,
                        expiryDate: driver.licenseExpiry,
                        isExpiringSoon: isLicenseExpiringSoon
                    },
                    medical: {
                        isValid: !isMedicalExpired,
                        expiryDate: driver.medicalCertificateExpiry,
                        isExpiringSoon: isMedicalExpiringSoon
                    },
                    training: {
                        isDue: isTrainingDue,
                        nextDue: driver.nextTrainingDue
                    }
                },
                overallCompliance: !isLicenseExpired && !isMedicalExpired && !isTrainingDue
            };
        });

        const compliantVehicles = vehicleCompliance.filter(v => v.overallCompliance).length;
        const compliantDrivers = driverCompliance.filter(d => d.overallCompliance).length;

        const expiringSoonVehicles = vehicleCompliance.filter(v => 
            v.compliance.insurance.isExpiringSoon || v.compliance.registration.isExpiringSoon
        ).length;

        const expiringSoonDrivers = driverCompliance.filter(d => 
            d.compliance.license.isExpiringSoon || d.compliance.medical.isExpiringSoon
        ).length;

        res.json({
            success: true,
            data: {
                vehicles: {
                    total: vehicles.length,
                    compliant: compliantVehicles,
                    nonCompliant: vehicles.length - compliantVehicles,
                    expiringSoon: expiringSoonVehicles,
                    complianceRate: vehicles.length > 0 ? (compliantVehicles / vehicles.length) * 100 : 0,
                    details: vehicleCompliance
                },
                drivers: {
                    total: drivers.length,
                    compliant: compliantDrivers,
                    nonCompliant: drivers.length - compliantDrivers,
                    expiringSoon: expiringSoonDrivers,
                    complianceRate: drivers.length > 0 ? (compliantDrivers / drivers.length) * 100 : 0,
                    details: driverCompliance
                }
            }
        });
    } catch (error) {
        console.error('Get compliance report error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
