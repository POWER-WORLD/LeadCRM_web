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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// RFC-compliant email regex that supports modern multi-character TLDs (e.g. .info, .online)
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Standard international phone regex supporting optional country code, brackets, spaces, dashes
const PHONE_REGEX = /^\+?[0-9\s().-]{7,25}$/;
const leadSchema = new mongoose_1.Schema({
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
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
        match: [PHONE_REGEX, "Please enter a valid phone number (7-25 digits)"],
    },
    company: {
        type: String,
        required: [true, "Company name is required"],
        trim: true,
        minlength: [1, "Company name is required"],
        maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    status: {
        type: String,
        enum: {
            values: ["New", "Contacted", "Qualified", "Converted", "Lost"],
            message: "{VALUE} is not a valid lead status",
        },
        default: "New",
        required: [true, "Status is required"],
    },
    notes: {
        type: String,
        trim: true,
        default: "",
        maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            const idString = ret._id ? ret._id.toString() : "";
            ret.id = idString;
            ret._id = idString;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: (_doc, ret) => {
            const idString = ret._id ? ret._id.toString() : "";
            ret.id = idString;
            ret._id = idString;
            delete ret.__v;
            return ret;
        },
    },
});
// Performance & search indexes
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: "text", email: "text", company: "text" });
const Lead = mongoose_1.default.models.Lead || mongoose_1.default.model("Lead", leadSchema);
exports.default = Lead;
//# sourceMappingURL=Lead.js.map