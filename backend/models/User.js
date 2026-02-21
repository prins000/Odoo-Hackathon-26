import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"]
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: {
            values: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
            message: 'Role must be one of: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst'
        },
        default: 'Fleet Manager'
    },
    avatar: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    address: {
        street: {
            type: String,
            default: ""
        },
        city: {
            type: String,
            default: ""
        },
        state: {
            type: String,
            default: ""
        },
        pincode: {
            type: String,
            default: ""
        }
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    emergencyContact: {
        name: {
            type: String,
            default: ""
        },
        phone: {
            type: String,
            default: ""
        },
        relation: {
            type: String,
            default: ""
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

export const User = mongoose.model('User', userSchema);
