import type { Request, Response } from "express";
/**
 * GET /api/leads
 * Get leads with pagination, search, status filter, and safe sorting.
 */
export declare const getLeads: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/leads
 * Create a new lead with comprehensive validation.
 */
export declare const createLead: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/leads/:id
 * Retrieve a single lead by its unique identifier.
 */
export declare const getLeadById: (req: Request, res: Response) => Promise<void>;
/**
 * PUT /api/leads/:id
 * Update an existing lead.
 */
export declare const updateLead: (req: Request, res: Response) => Promise<void>;
/**
 * DELETE /api/leads/:id
 * Delete a lead by its unique identifier.
 */
export declare const deleteLead: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/leads/stats
 * Get lead counts and analytics across statuses.
 */
export declare const getLeadStats: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=leadController.d.ts.map