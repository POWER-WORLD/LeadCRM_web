import mongoose, { type Document, type Model } from "mongoose";
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
declare const User: Model<UserDocument>;
export default User;
//# sourceMappingURL=User.d.ts.map