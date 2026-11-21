import { Router } from "express";
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  getLeadStats,
} from "../controllers/leadController";
import { optionalAuthenticateUser } from "../middleware/authMiddleware";

const router: Router = Router();

// Attach optional auth to leads router (provides req.user if token is present, while keeping public access open for web demo)
router.use(optionalAuthenticateUser);

// GET /api/leads - Retrieve leads with pagination, search, status filter, sorting
router.get("/", getLeads);

// GET /api/leads/stats - Retrieve aggregated status statistics
router.get("/stats", getLeadStats);

// GET /api/leads/:id - Retrieve lead by ID
router.get("/:id", getLeadById);

// POST /api/leads - Create new lead
router.post("/", createLead);

// PUT /api/leads/:id - Update lead details
router.put("/:id", updateLead);

// DELETE /api/leads/:id - Remove lead
router.delete("/:id", deleteLead);

export default router;
