import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Driver name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true
    },
    licenseNumber: {
        type: String,
        required: [true, "License number is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    licenseType: {
        type: String,
        required: [true, "License type is required"],
        enum: {
            values: ['Light Motor Vehicle', 'Heavy Motor Vehicle', 'Motorcycle', 'Commercial'],
            message: 'License type must be valid'
        }
    },
    licenseExpiry: {
        type: Date,
        required: [true, "License expiry date is required"]
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['On Duty', 'Off Duty', 'Suspended'],
            message: 'Status must be one of: On Duty, Off Duty, Suspended'
        },
        default: 'Off Duty'
    },
    safetyScore: {
        type: Number,
        default: 100,
        min: [0, "Safety score cannot be negative"],
        max: [100, "Safety score cannot exceed 100"]
    },
    tripCompletionRate: {
        type: Number,
        default: 100,
        min: [0, "Completion rate cannot be negative"],
        max: [100, "Completion rate cannot exceed 100"]
    },
    totalTrips: {
        type: Number,
        default: 0,
        min: [0, "Total trips cannot be negative"]
    },
    completedTrips: {
        type: Number,
        default: 0,
        min: [0, "Completed trips cannot be negative"]
    },
    currentVehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        default: null
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    dateOfBirth: {
        type: Date,
        required: [true, "Date of birth is required"]
    },
    dateOfJoining: {
        type: Date,
        default: Date.now
    },
    salary: {
        type: Number,
        required: [true, "Salary is required"],
        min: [0, "Salary must be positive"]
    },
    bankDetails: {
        accountNumber: String,
        bankName: String,
        ifscCode: String
    },
    medicalCertificateExpiry: {
        type: Date,
        required: [true, "Medical certificate expiry is required"]
    },
    lastTrainingDate: {
        type: Date,
        default: null
    },
    nextTrainingDue: {
        type: Date,
        default: null
    },
    violations: {
        type: Number,
        default: 0,
        min: [0, "Violations cannot be negative"]
    },
    accidents: {
        type: Number,
        default: 0,
        min: [0, "Accidents cannot be negative"]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

driverSchema.virtual('isLicenseExpired').get(function() {
    return new Date() >= this.licenseExpiry;
});

driverSchema.virtual('isMedicalCertificateExpired').get(function() {
    return new Date() >= this.medicalCertificateExpiry;
});

driverSchema.virtual('isTrainingDue').get(function() {
    if (!this.nextTrainingDue) return false;
    return new Date() >= this.nextTrainingDue;
});

driverSchema.methods.calculateCompletionRate = function() {
    if (this.totalTrips === 0) return 100;
    return Math.round((this.completedTrips / this.totalTrips) * 100);
};

export const Driver = mongoose.model('Driver', driverSchema);
