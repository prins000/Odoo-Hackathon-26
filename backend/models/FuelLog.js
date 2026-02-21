import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
    fuelId: {
        type: String,
        required: [true, "Fuel ID is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, "Vehicle is required"]
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    trip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trip',
        default: null
    },
    date: {
        type: Date,
        required: [true, "Date is required"],
        default: Date.now
    },
    fuelType: {
        type: String,
        required: [true, "Fuel type is required"],
        enum: {
            values: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
            message: 'Fuel type must be valid'
        }
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
        min: [0, "Quantity must be positive"]
    },
    unit: {
        type: String,
        required: [true, "Unit is required"],
        enum: {
            values: ['Liters', 'Gallons', 'KWh'],
            message: 'Unit must be valid'
        },
        default: 'Liters'
    },
    pricePerUnit: {
        type: Number,
        required: [true, "Price per unit is required"],
        min: [0, "Price must be positive"]
    },
    totalAmount: {
        type: Number,
        required: [true, "Total amount is required"],
        min: [0, "Amount must be positive"]
    },
    odometerReading: {
        type: Number,
        required: [true, "Odometer reading is required"],
        min: [0, "Odometer cannot be negative"]
    },
    previousOdometerReading: {
        type: Number,
        default: null
    },
    distanceSinceLastFuel: {
        type: Number,
        default: null
    },
    fuelEfficiency: {
        type: Number,
        default: null
    },
    fuelStation: {
        name: {
            type: String,
            required: [true, "Fuel station name is required"],
            trim: true
        },
        address: String,
        city: String,
        state: String,
        pincode: String,
        phone: String,
        gstNumber: String
    },
    paymentMethod: {
        type: String,
        required: [true, "Payment method is required"],
        enum: {
            values: ['Cash', 'Card', 'Fuel Card', 'Bank Transfer', 'Credit'],
            message: 'Payment method must be valid'
        }
    },
    fuelCard: {
        cardNumber: String,
        cardType: String,
        limit: Number,
        balance: Number
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
    expense: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Expense',
        default: null
    },
    tankCapacity: {
        type: Number,
        default: null
    },
    fuelLevelBefore: {
        type: Number,
        default: null,
        min: [0, "Fuel level cannot be negative"],
        max: [100, "Fuel level cannot exceed 100"]
    },
    fuelLevelAfter: {
        type: Number,
        default: null,
        min: [0, "Fuel level cannot be negative"],
        max: [100, "Fuel level cannot exceed 100"]
    },
    isFullTank: {
        type: Boolean,
        default: false
    },
    purpose: {
        type: String,
        enum: ['Regular', 'Trip', 'Emergency', 'Maintenance', 'Other'],
        default: 'Regular'
    },
    notes: {
        type: String,
        default: ""
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    weather: {
        type: String,
        enum: ['Clear', 'Rain', 'Snow', 'Fog', 'Storm', 'Unknown'],
        default: 'Unknown'
    },
    trafficConditions: {
        type: String,
        enum: ['Light', 'Moderate', 'Heavy', 'Unknown'],
        default: 'Unknown'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Creator is required"]
    }
}, {
    timestamps: true
});

fuelLogSchema.pre('save', function() {
    if (this.quantity && this.pricePerUnit) {
        this.totalAmount = this.quantity * this.pricePerUnit;
    }
    
    if (this.odometerReading && this.previousOdometerReading) {
        this.distanceSinceLastFuel = this.odometerReading - this.previousOdometerReading;
        
        if (this.distanceSinceLastFuel > 0 && this.quantity > 0) {
            this.fuelEfficiency = this.distanceSinceLastFuel / this.quantity;
        }
    }
});

fuelLogSchema.virtual('costPerKm').get(function() {
    if (!this.distanceSinceLastFuel || this.distanceSinceLastFuel === 0) return 0;
    return this.totalAmount / this.distanceSinceLastFuel;
});

fuelLogSchema.virtual('isEfficient').get(function() {
    if (!this.fuelEfficiency) return false;
    // Benchmark efficiency based on vehicle type (would need vehicle reference)
    const benchmark = 10; // km/l - this should be dynamic based on vehicle
    return this.fuelEfficiency >= benchmark;
});

export const FuelLog = mongoose.model('FuelLog', fuelLogSchema);
