import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
    maintenanceId: {
        type: String,
        required: [true, "Maintenance ID is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, "Vehicle is required"]
    },
    type: {
        type: String,
        required: [true, "Maintenance type is required"],
        enum: {
            values: ['Preventative', 'Reactive', 'Emergency', 'Scheduled'],
            message: 'Type must be one of: Preventative, Reactive, Emergency, Scheduled'
        }
    },
    category: {
        type: String,
        required: [true, "Maintenance category is required"],
        enum: {
            values: ['Oil Change', 'Tire Service', 'Brake Service', 'Engine Service', 'Transmission', 
                    'Electrical', 'Body Work', 'AC Service', 'General Inspection', 'Other'],
            message: 'Category must be valid'
        }
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'On Hold'],
            message: 'Status must be one of: Scheduled, In Progress, Completed, Cancelled, On Hold'
        },
        default: 'Scheduled'
    },
    scheduledDate: {
        type: Date,
        required: [true, "Scheduled date is required"]
    },
    startDate: {
        type: Date,
        default: null
    },
    completionDate: {
        type: Date,
        default: null
    },
    estimatedDuration: {
        type: Number, // in hours
        required: [true, "Estimated duration is required"],
        min: [0, "Duration must be positive"]
    },
    actualDuration: {
        type: Number, // in hours
        default: null
    },
    cost: {
        parts: {
            type: Number,
            default: 0,
            min: [0, "Parts cost cannot be negative"]
        },
        labor: {
            type: Number,
            default: 0,
            min: [0, "Labor cost cannot be negative"]
        },
        other: {
            type: Number,
            default: 0,
            min: [0, "Other costs cannot be negative"]
        }
    },
    technician: {
        name: {
            type: String,
            required: [true, "Technician name is required"],
            trim: true
        },
        phone: String,
        email: String,
        company: String
    },
    workOrder: {
        workOrderNumber: {
            type: String,
            required: [true, "Work order number is required"],
            unique: true,
            uppercase: true
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Issuer is required"]
        },
        issuedDate: {
            type: Date,
            default: Date.now
        }
    },
    parts: [{
        partName: {
            type: String,
            required: [true, "Part name is required"],
            trim: true
        },
        partNumber: String,
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"]
        },
        unitCost: {
            type: Number,
            required: [true, "Unit cost is required"],
            min: [0, "Unit cost cannot be negative"]
        },
        totalCost: {
            type: Number,
            required: [true, "Total cost is required"],
            min: [0, "Total cost cannot be negative"]
        },
        supplier: String,
        warranty: {
            period: Number, // in months
            expiryDate: Date
        }
    }],
    labor: [{
        task: {
            type: String,
            required: [true, "Task description is required"],
            trim: true
        },
        hours: {
            type: Number,
            required: [true, "Hours are required"],
            min: [0, "Hours cannot be negative"]
        },
        rate: {
            type: Number,
            required: [true, "Hourly rate is required"],
            min: [0, "Rate cannot be negative"]
        },
        totalCost: {
            type: Number,
            required: [true, "Total cost is required"],
            min: [0, "Total cost cannot be negative"]
        },
        technician: String
    }],
    odometerAtService: {
        type: Number,
        required: [true, "Odometer reading is required"],
        min: [0, "Odometer cannot be negative"]
    },
    nextServiceDue: {
        type: Date,
        default: null
    },
    nextServiceOdometer: {
        type: Number,
        default: null
    },
    documents: [{
        type: {
            type: String,
            enum: ['Invoice', 'Receipt', 'Warranty', 'Inspection Report', 'Photo', 'Other'],
            required: true
        },
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    notes: {
        type: String,
        default: ""
    },
    issuesFound: [{
        issue: String,
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },
        recommendedAction: String,
        estimatedCost: Number
    }],
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

maintenanceSchema.virtual('totalCost').get(function() {
    return this.cost.parts + this.cost.labor + this.cost.other;
});

maintenanceSchema.virtual('isOverdue').get(function() {
    return new Date() > this.scheduledDate && this.status !== 'Completed';
});

maintenanceSchema.virtual('duration').get(function() {
    if (!this.startDate || !this.completionDate) return null;
    return (this.completionDate - this.startDate) / (1000 * 60 * 60); // in hours
});

export const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
