import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Vehicle name is required"],
        trim: true
    },
    model: {
        type: String,
        required: [true, "Vehicle model is required"],
        trim: true
    },
    licensePlate: {
        type: String,
        required: [true, "License plate is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    maxLoadCapacity: {
        type: Number,
        required: [true, "Max load capacity is required"],
        min: [0, "Load capacity must be positive"]
    },
    odometer: {
        type: Number,
        default: 0,
        min: [0, "Odometer cannot be negative"]
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['Available', 'On Trip', 'In Shop', 'Out of Service'],
            message: 'Status must be one of: Available, On Trip, In Shop, Out of Service'
        },
        default: 'Available'
    },
    vehicleType: {
        type: String,
        required: [true, "Vehicle type is required"],
        enum: {
            values: ['Truck', 'Van', 'Bike'],
            message: 'Vehicle type must be one of: Truck, Van, Bike'
        }
    },
    acquisitionCost: {
        type: Number,
        required: [true, "Acquisition cost is required"],
        min: [0, "Acquisition cost must be positive"]
    },
    currentDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        default: null
    },
    lastMaintenanceDate: {
        type: Date,
        default: null
    },
    nextMaintenanceDue: {
        type: Date,
        default: null
    },
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'Electric', 'CNG'],
        default: 'Diesel'
    },
    insuranceExpiry: {
        type: Date,
        required: [true, "Insurance expiry date is required"]
    },
    registrationExpiry: {
        type: Date,
        required: [true, "Registration expiry date is required"]
    },
    location: {
        type: String,
        default: "Garage"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

vehicleSchema.virtual('isMaintenanceDue').get(function() {
    if (!this.nextMaintenanceDue) return false;
    return new Date() >= this.nextMaintenanceDue;
});

vehicleSchema.virtual('isInsuranceExpired').get(function() {
    return new Date() >= this.insuranceExpiry;
});

vehicleSchema.virtual('isRegistrationExpired').get(function() {
    return new Date() >= this.registrationExpiry;
});

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
