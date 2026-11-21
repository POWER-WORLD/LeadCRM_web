import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "../types";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const RFC_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const userSchema = new Schema<UserDocument>(
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        const idString = ret._id ? ret._id.toString() : "";
        ret.id = idString;
        ret._id = idString;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        const idString = ret._id ? ret._id.toString() : "";
        ret.id = idString;
        ret._id = idString;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Hash password before saving (Mongoose 8 async pre-save without next callback)
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

// Compare hashed password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexing
userSchema.index({ role: 1 });

const User: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export default User;
