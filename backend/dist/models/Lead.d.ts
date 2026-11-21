import mongoose, { type Document, type Model } from "mongoose";
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
declare const Lead: Model<LeadDocument>;
export default Lead;
//# sourceMappingURL=Lead.d.ts.map