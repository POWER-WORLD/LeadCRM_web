import mongoose, { Schema, type Document } from "mongoose"

export interface LeadDocument extends Document {
  name: string
  email: string
  phone: string
  company: string
  status: "New" | "Contacted" | "Qualified" | "Converted" | "Lost"
  notes: string
  createdAt: Date
  updatedAt: Date
}

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
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/, "Please enter a valid phone number"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [200, "Company name cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
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
      transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

// Create indexes for better query performance
leadSchema.index({ email: 1 })
leadSchema.index({ status: 1 })
leadSchema.index({ createdAt: -1 })
leadSchema.index({ name: "text", email: "text", company: "text" })

export default mongoose.model<LeadDocument>("Lead", leadSchema)
