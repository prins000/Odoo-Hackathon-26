import { Expense } from '../models/Expense.js';
import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../models/Driver.js';
import { User } from '../models/User.js';

export const createExpense = async (req, res) => {
    try {
        const expenseData = req.body;
        const { vehicle } = expenseData;

        const vehicleDoc = await Vehicle.findById(vehicle);
        if (!vehicleDoc) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        const expenseId = `EXP${Date.now()}${Math.floor(Math.random() * 1000)}`;

        const expense = await Expense.create({
            ...expenseData,
            expenseId,
            createdBy: req.user.id
        });

        const createdExpense = await Expense.findById(expense._id)
            .populate('vehicle', 'name licensePlate vehicleType')
            .populate('driver', 'name phone licenseNumber')
            .populate('trip', 'tripId origin destination')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: createdExpense
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getAllExpenses = async (req, res) => {
    try {
        const { 
            type, 
            category, 
            status, 
            vehicle, 
            driver, 
            paymentMethod,
            search,
            startDate,
            endDate 
        } = req.query;
        
        let filter = {};
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (vehicle) filter.vehicle = vehicle;
        if (driver) filter.driver = driver;
        if (paymentMethod) filter.paymentMethod = paymentMethod;
        
        if (search) {
            filter.$or = [
                { expenseId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'vendor.name': { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(filter)
            .populate('vehicle', 'name licensePlate vehicleType')
            .populate('driver', 'name phone licenseNumber')
            .populate('trip', 'tripId origin destination')
            .populate('createdBy', 'name email')
            .sort({ date: -1 });

        res.json({
            success: true,
            data: expenses
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const expense = await Expense.findById(id)
            .populate('vehicle', 'name licensePlate vehicleType odometer')
            .populate('driver', 'name phone licenseNumber')
            .populate('trip', 'tripId origin destination status')
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('paidBy', 'name email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const expense = await Expense.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('vehicle', 'name licensePlate vehicleType')
         .populate('driver', 'name phone licenseNumber')
         .populate('trip', 'tripId origin destination')
         .populate('createdBy', 'name email');

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: expense
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findByIdAndDelete(id);
        
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const approveExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Expense cannot be approved in current status'
            });
        }

        await Expense.findByIdAndUpdate(id, {
            status: 'Approved',
            approvedBy: req.user.id,
            approvedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Expense approved successfully'
        });
    } catch (error) {
        console.error('Approve expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const rejectExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Expense cannot be rejected in current status'
            });
        }

        await Expense.findByIdAndUpdate(id, {
            status: 'Rejected'
        });

        res.json({
            success: true,
            message: 'Expense rejected successfully'
        });
    } catch (error) {
        console.error('Reject expense error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const markExpenseAsPaid = async (req, res) => {
    try {
        const { id } = req.params;

        const expense = await Expense.findById(id);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (expense.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Expense must be approved before marking as paid'
            });
        }

        await Expense.findByIdAndUpdate(id, {
            status: 'Paid',
            paidBy: req.user.id,
            paidAt: new Date()
        });

        res.json({
            success: true,
            message: 'Expense marked as paid successfully'
        });
    } catch (error) {
        console.error('Mark expense as paid error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getExpenseStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let dateFilter = {};
        if (startDate || endDate) {
            dateFilter.date = {};
            if (startDate) dateFilter.date.$gte = new Date(startDate);
            if (endDate) dateFilter.date.$lte = new Date(endDate);
        }

        const stats = await Expense.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        type: '$type',
                        status: '$status'
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalTax: { $sum: '$tax.totalTax' }
                }
            }
        ]);

        const typeStats = {};
        const statusStats = {};
        let totalAmount = 0;
        let totalTax = 0;

        stats.forEach(stat => {
            const key = `${stat._id.type}-${stat._id.status}`;
            typeStats[key] = {
                count: stat.count,
                amount: stat.totalAmount,
                tax: stat.totalTax
            };

            if (!statusStats[stat._id.status]) {
                statusStats[stat._id.status] = { count: 0, amount: 0, tax: 0 };
            }
            statusStats[stat._id.status].count += stat.count;
            statusStats[stat._id.status].amount += stat.totalAmount;
            statusStats[stat._id.status].tax += stat.totalTax;

            totalAmount += stat.totalAmount;
            totalTax += stat.totalTax;
        });

        const totalExpenses = await Expense.countDocuments(dateFilter);
        const pendingExpenses = statusStats['Pending']?.count || 0;
        const approvedExpenses = statusStats['Approved']?.count || 0;
        const paidExpenses = statusStats['Paid']?.count || 0;

        res.json({
            success: true,
            data: {
                totalExpenses,
                pendingExpenses,
                approvedExpenses,
                paidExpenses,
                totalAmount,
                totalTax,
                totalWithTax: totalAmount + totalTax,
                typeBreakdown: typeStats,
                statusBreakdown: statusStats
            }
        });
    } catch (error) {
        console.error('Get expense stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getVehicleExpenses = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { startDate, endDate } = req.query;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        let filter = { vehicle: vehicleId };
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(filter)
            .populate('driver', 'name phone licenseNumber')
            .populate('trip', 'tripId origin destination')
            .sort({ date: -1 });

        const totalAmount = expenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

        res.json({
            success: true,
            data: {
                expenses,
                totalAmount,
                vehicle: {
                    id: vehicle._id,
                    name: vehicle.name,
                    licensePlate: vehicle.licensePlate,
                    vehicleType: vehicle.vehicleType
                }
            }
        });
    } catch (error) {
        console.error('Get vehicle expenses error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
