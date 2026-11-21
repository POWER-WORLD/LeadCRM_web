import type { Request } from "express";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
export declare const ALLOWED_LEAD_STATUSES: readonly LeadStatus[];
export declare const ALLOWED_SORT_FIELDS: readonly string[];
export interface Lead {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    status: LeadStatus;
    notes: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface LeadWithId extends Lead {
    id: string;
    _id: string;
}
export interface LeadQuery {
    page?: string | number;
    limit?: string | number;
    search?: string;
    status?: LeadStatus | "all";
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}
export interface LeadResponse {
    leads: LeadWithId[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface LeadStatsResponse {
    total: number;
    statusCounts: Record<LeadStatus, number>;
    conversionRate: number;
}
export type UserRole = "admin" | "manager" | "agent";
export declare const ALLOWED_USER_ROLES: readonly UserRole[];
export interface User {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface UserWithId extends User {
    id: string;
    _id: string;
}
export interface AuthResponse {
    user: UserWithId;
    token: string;
}
export interface JwtUserPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
export interface AuthenticatedRequest extends Request {
    user?: UserWithId;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    details?: any;
}
//# sourceMappingURL=index.d.ts.map