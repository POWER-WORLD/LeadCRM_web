"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [RFC_EMAIL_REGEX, "Please enter a valid email address"],
        maxlength: [150, "Email cannot exceed 150 characters"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false, // Omitted by default in queries for security
    },
    role: {
        type: String,
        enum: {
            values: ["admin", "manager", "agent"],
            message: "{VALUE} is not a valid user role",
        },
        default: "agent",
        required: [true, "Role is required"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            const idString = ret._id ? ret._id.toString() : "";
            ret.id = idString;
            ret._id = idString;
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: (_doc, ret) => {
            const idString = ret._id ? ret._id.toString() : "";
            ret.id = idString;
            ret._id = idString;
            delete ret.password;
            delete ret.__v;
            return ret;
        },
    },
});
// Hash password before saving (Mongoose 8 async pre-save without next callback)
userSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password) {
        return;
    }
    const saltRounds = 12;
    this.password = await bcryptjs_1.default.hash(this.password, saltRounds);
});
// Compare hashed password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        return false;
    }
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Indexing
userSchema.index({ role: 1 });
const User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map