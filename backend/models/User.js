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
            values: ['admin', 'manager', 'dispatcher', 'driver', 'Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
            message: 'Role must be one of: admin, manager, dispatcher, driver, Fleet Manager, Dispatcher, Safety Officer, Financial Analyst'
        },
        default: 'driver'
    },
    avatar: {
        type: String,
        default: ""
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
