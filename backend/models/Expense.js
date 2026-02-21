import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    expenseId: {
        type: String,
        required: [true, "Expense ID is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        required: [true, "Expense type is required"],
        enum: {
            values: ['Fuel', 'Maintenance', 'Toll', 'Parking', 'Fine', 'Insurance', 'Registration', 
                    'Salary', 'Other', 'Repair', 'Parts', 'Labor', 'Cleaning', 'Battery', 'Tires'],
            message: 'Type must be valid'
        }
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: {
            values: ['Operating', 'Maintenance', 'Administrative', 'Capital', 'Emergency'],
            message: 'Category must be one of: Operating, Maintenance, Administrative, Capital, Emergency'
        }
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be positive"]
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
        default: Date.now
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: {
            values: ['Cash', 'Card', 'Bank Transfer', 'Check', 'Credit', 'Online'],
            message: 'Payment method must be valid'
        }
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['Pending', 'Approved', 'Paid', 'Rejected', 'Cancelled'],
            message: 'Status must be one of: Pending, Approved, Paid, Rejected, Cancelled'
        },
        default: 'Pending'
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, "Vehicle is required"]
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        default: null
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    vendor: {
        name: {
            type: String,
            required: [true, "Vendor name is required"],
            trim: true
        },
        phone: String,
        email: String,
        address: String,
        gstNumber: String,
        vendorCode: String
    },
    receipt: {
        receiptNumber: String,
        receiptUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        verified: {
            type: Boolean,
            default: false
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        verifiedAt: Date
    },
    fuelDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FuelLog',
        default: null
    },
    maintenanceDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Maintenance',
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: Date,
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    paidAt: Date,
    accounting: {
        accountCode: String,
        department: String,
        project: String,
        budgetCategory: String,
        fiscalYear: String,
        quarter: String,
        month: String
    },
    reimbursement: {
        isReimbursable: {
            type: Boolean,
            default: false
        },
        reimbursedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        reimbursedAt: Date,
        reimbursementAmount: Number,
        reimbursementMethod: String
    },
    tax: {
        gst: {
            type: Number,
            default: 0,
            min: [0, "GST cannot be negative"]
        },
        cgst: {
            type: Number,
            default: 0,
            min: [0, "CGST cannot be negative"]
        },
        sgst: {
            type: Number,
            default: 0,
            min: [0, "SGST cannot be negative"]
        },
        totalTax: {
            type: Number,
            default: 0,
            min: [0, "Total tax cannot be negative"]
        }
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    exchangeRate: {
        type: Number,
        default: 1,
        min: [0, "Exchange rate must be positive"]
    },
    notes: {
        type: String,
        default: ""
    },
    attachments: [{
        type: {
            type: String,
            enum: ['Receipt', 'Invoice', 'Document', 'Photo', 'Other'],
            required: true
        },
        url: String,
        fileName: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringDetails: {
        frequency: {
            type: String,
            enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'],
            default: 'Monthly'
        },
        nextDue: Date,
        endDate: Date
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Creator is required"]
    }
}, {
    timestamps: true
});

expenseSchema.virtual('totalAmount').get(function() {
    return this.amount + this.tax.totalTax;
});

expenseSchema.virtual('totalAmountInINR').get(function() {
    return this.totalAmount * this.exchangeRate;
});

expenseSchema.virtual('isOverdue').get(function() {
    if (this.status === 'Paid') return false;
    const dueDate = new Date(this.date);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term
    return new Date() > dueDate;
});

expenseSchema.pre('save', function() {
    this.tax.totalTax = this.tax.gst + this.tax.cgst + this.tax.sgst;
});

export const Expense = mongoose.model('Expense', expenseSchema);
