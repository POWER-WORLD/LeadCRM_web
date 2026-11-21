"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leadController_1 = require("../controllers/leadController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Attach optional auth to leads router (provides req.user if token is present, while keeping public access open for web demo)
router.use(authMiddleware_1.optionalAuthenticateUser);
// GET /api/leads - Retrieve leads with pagination, search, status filter, sorting
router.get("/", leadController_1.getLeads);
// GET /api/leads/stats - Retrieve aggregated status statistics
router.get("/stats", leadController_1.getLeadStats);
// GET /api/leads/:id - Retrieve lead by ID
router.get("/:id", leadController_1.getLeadById);
// POST /api/leads - Create new lead
router.post("/", leadController_1.createLead);
// PUT /api/leads/:id - Update lead details
router.put("/:id", leadController_1.updateLead);
// DELETE /api/leads/:id - Remove lead
router.delete("/:id", leadController_1.deleteLead);
exports.default = router;
//# sourceMappingURL=leadRoutes.js.map