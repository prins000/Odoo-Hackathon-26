import { Driver } from '../models/Driver.js';
import { Vehicle } from '../models/Vehicle.js';

export const createDriver = async (req, res) => {
    try {
        const driverData = req.body;
        
        const existingDriver = await Driver.findOne({ licenseNumber: driverData.licenseNumber });
        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this license number already exists'
            });
        }

        const existingEmail = await Driver.findOne({ email: driverData.email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Driver with this email already exists'
            });
        }

        const driver = await Driver.create(driverData);
        
        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: driver
        });
    } catch (error) {
        console.error('Create driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllDrivers = async (req, res) => {
    try {
        const { status, search } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { licenseNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const drivers = await Driver.find(filter)
            .populate('currentVehicle', 'name licensePlate vehicleType status')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: drivers
        });
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const driver = await Driver.findById(id)
            .populate('currentVehicle', 'name licensePlate vehicleType status odometer');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            data: driver
        });
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const driver = await Driver.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('currentVehicle', 'name licensePlate vehicleType status');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.json({
            success: true,
            message: 'Driver updated successfully',
            data: driver
        });
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;

        const driver = await Driver.findByIdAndDelete(id);
        
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (driver.currentVehicle) {
            await Vehicle.findByIdAndUpdate(
                driver.currentVehicle,
                { currentDriver: null, status: 'Available' }
            );
        }

        res.json({
            success: true,
            message: 'Driver deleted successfully'
        });
    } catch (error) {
        console.error('Delete driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateDriverStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, vehicleId } = req.body;

        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (status === 'On Duty' && !vehicleId) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID is required when assigning driver to duty'
            });
        }

        if (status === 'Off Duty' && driver.currentVehicle) {
            await Vehicle.findByIdAndUpdate(
                driver.currentVehicle,
                { currentDriver: null, status: 'Available' }
            );
        }

        if (status === 'On Duty' && vehicleId) {
            const vehicle = await Vehicle.findById(vehicleId);
            if (!vehicle) {
                return res.status(404).json({
                    success: false,
                    message: 'Vehicle not found'
                });
            }

            if (vehicle.status !== 'Available') {
                return res.status(400).json({
                    success: false,
                    message: 'Vehicle is not available for assignment'
                });
            }

            await Vehicle.findByIdAndUpdate(
                vehicleId,
                { currentDriver: id, status: 'On Trip' }
            );
        }

        driver.status = status;
        if (vehicleId) {
            driver.currentVehicle = vehicleId;
        } else if (status === 'Off Duty') {
            driver.currentVehicle = null;
        }

        await driver.save();

        const updatedDriver = await Driver.findById(id)
            .populate('currentVehicle', 'name licensePlate vehicleType status');

        res.json({
            success: true,
            message: 'Driver status updated successfully',
            data: updatedDriver
        });
    } catch (error) {
        console.error('Update driver status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getDriverCompliance = async (req, res) => {
    try {
        const drivers = await Driver.find({ isActive: true });

        const complianceData = drivers.map(driver => {
            const today = new Date();
            const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

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
                safetyScore: driver.safetyScore,
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

        const compliantDrivers = complianceData.filter(d => d.overallCompliance).length;
        const nonCompliantDrivers = complianceData.length - compliantDrivers;

        res.json({
            success: true,
            data: {
                drivers: complianceData,
                summary: {
                    totalDrivers: complianceData.length,
                    compliantDrivers,
                    nonCompliantDrivers,
                    complianceRate: complianceData.length > 0 ? (compliantDrivers / complianceData.length) * 100 : 0
                }
            }
        });
    } catch (error) {
        console.error('Get driver compliance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateDriverPerformance = async (req, res) => {
    try {
        const { id } = req.params;
        const { safetyScore, violations, accidents, completedTrips } = req.body;

        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (safetyScore !== undefined) {
            driver.safetyScore = Math.max(0, Math.min(100, safetyScore));
        }
        if (violations !== undefined) {
            driver.violations = Math.max(0, violations);
        }
        if (accidents !== undefined) {
            driver.accidents = Math.max(0, accidents);
        }
        if (completedTrips !== undefined) {
            driver.completedTrips = Math.max(0, completedTrips);
            driver.tripCompletionRate = driver.calculateCompletionRate();
        }

        await driver.save();

        res.json({
            success: true,
            message: 'Driver performance updated successfully',
            data: driver
        });
    } catch (error) {
        console.error('Update driver performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
