import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
    tripId: {
        type: String,
        required: [true, "Trip ID is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    origin: {
        type: String,
        required: [true, "Origin is required"],
        trim: true
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true
    },
    cargoWeight: {
        type: Number,
        required: [true, "Cargo weight is required"],
        min: [0, "Cargo weight must be positive"]
    },
    cargoType: {
        type: String,
        required: [true, "Cargo type is required"],
        enum: {
            values: ['General Goods', 'Perishable', 'Hazardous', 'Liquid', 'Fragile', 'Oversized'],
            message: 'Cargo type must be valid'
        }
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['Draft', 'Dispatched', 'In Transit', 'Completed', 'Cancelled', 'Delayed'],
            message: 'Status must be one of: Draft, Dispatched, In Transit, Completed, Cancelled, Delayed'
        },
        default: 'Draft'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
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
    startOdometer: {
        type: Number,
        required: [true, "Start odometer is required"],
        min: [0, "Odometer cannot be negative"]
    },
    endOdometer: {
        type: Number,
        default: null,
        min: [0, "Odometer cannot be negative"]
    },
    distance: {
        type: Number, // in km
        required: [true, "Distance is required"],
        min: [0, "Distance must be positive"]
    },
    revenue: {
        type: Number,
        required: [true, "Revenue is required"],
        min: [0, "Revenue must be positive"]
    },
    estimatedCost: {
        type: Number,
        required: [true, "Estimated cost is required"],
        min: [0, "Cost must be positive"]
    },
    actualCost: {
        type: Number,
        default: null,
        min: [0, "Cost must be positive"]
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, "Vehicle is required"]
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: [true, "Driver is required"]
    },
    dispatcher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Dispatcher is required"]
    },
    customer: {
        name: {
            type: String,
            required: [true, "Customer name is required"],
            trim: true
        },
        phone: {
            type: String,
            required: [true, "Customer phone is required"],
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        address: String
    },
    route: {
        waypoints: [String],
        tolls: [{
            name: String,
            cost: Number,
            location: String
        }],
        fuelStops: [{
            location: String,
            liters: Number,
            cost: Number
        }],
        restStops: [{
            location: String,
            duration: Number // in minutes
        }]
    },
    documents: [{
        type: {
            type: String,
            enum: ['Bill of Lading', 'Delivery Receipt', 'Insurance', 'Customs', 'Other'],
            required: true
        },
        documentNumber: String,
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
    delayReason: {
        type: String,
        default: ""
    },
    cancellationReason: {
        type: String,
        default: ""
    },
    tracking: {
        currentLocation: {
            latitude: Number,
            longitude: Number,
            address: String
        },
        lastUpdate: {
            type: Date,
            default: Date.now
        },
        estimatedArrival: Date
    },
    weatherConditions: {
        type: String,
        enum: ['Clear', 'Rain', 'Snow', 'Fog', 'Storm', 'Unknown'],
        default: 'Unknown'
    },
    roadConditions: {
        type: String,
        enum: ['Good', 'Fair', 'Poor', 'Construction', 'Unknown'],
        default: 'Unknown'
    }
}, {
    timestamps: true
});

tripSchema.virtual('profit').get(function() {
    if (!this.actualCost) return this.revenue - this.estimatedCost;
    return this.revenue - this.actualCost;
});

tripSchema.virtual('fuelEfficiency').get(function() {
    if (!this.endOdometer || !this.startOdometer) return 0;
    const distance = this.endOdometer - this.startOdometer;
    // This would need to be calculated based on fuel logs
    return distance; // placeholder
});

tripSchema.virtual('isDelayed').get(function() {
    if (!this.endDate || !this.estimatedDuration) return false;
    const actualDuration = (this.endDate - this.startDate) / (1000 * 60 * 60); // convert to hours
    return actualDuration > this.estimatedDuration;
});

export const Trip = mongoose.model('Trip', tripSchema);
