import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { LeadStatus } from "../types";

export interface LeadDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// RFC-compliant email regex that supports modern multi-character TLDs (e.g. .info, .online)
const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Standard international phone regex supporting optional country code, brackets, spaces, dashes
const PHONE_REGEX = /^\+?[0-9\s().-]{7,25}$/;

const leadSchema = new Schema<LeadDocument>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        const idString = ret._id ? ret._id.toString() : "";
        ret.id = idString;
        ret._id = idString;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        const idString = ret._id ? ret._id.toString() : "";
        ret.id = idString;
        ret._id = idString;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Performance & search indexes
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: "text", email: "text", company: "text" });

const Lead: Model<LeadDocument> = mongoose.models.Lead || mongoose.model<LeadDocument>("Lead", leadSchema);

export default Lead;
