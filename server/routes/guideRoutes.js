import express from "express";
import { protectGuide } from "../middlewares/authMiddleware.js";
import {
  registerGuide,
  loginGuide,
  getAuthenticatedGuide,
  updateAuthenticatedGuide,
  changeGuidePassword,
  getGuideProfileById,
  updateGuideProfile,
  getGuideDashboard,
  getGuideAnnouncements,
  getGuideGroups,
  createGroupForGuide,
  getGroupByIdForGuide,
  updateGroupForGuide,
  deleteGroupForGuide,
  listGuidePanelGroups,
  getGuidePanelGroupDetails,
  updateGroupDetailsAndMembers,
  searchStudentsByEnrollment,
  getAvailableStudentsForGroup,
  listProjectApprovalsForGuide,
  approveProjectProposal,
  rejectProjectProposal,
} from "../controllers/guideController.js";

const router = express.Router();

// ----------------------------------------------------------------------
// 1. AUTH & PROFILE ROUTES (Original guideRoutes.js content)
// ----------------------------------------------------------------------

// POST /api/auth/guide/register
router.post("/auth/guide/register", registerGuide);

// POST /api/auth/guide/login
router.post("/auth/guide/login", loginGuide);

// GET /api/auth/guide/me
router.get("/auth/guide/me", protectGuide, getAuthenticatedGuide);

// PUT /api/auth/guide/me
router.put("/auth/guide/me", protectGuide, updateAuthenticatedGuide);

// PUT /api/auth/guide/change-password
router.put("/auth/guide/change-password", protectGuide, changeGuidePassword);

// ----------------------------------------------------------------------
// 2. GUIDE PROFILE/DASHBOARD ROUTES (Original guideRoutes.js content)
// ----------------------------------------------------------------------

// GET /api/guides/:id/profile
router.get("/guides/:id/profile", protectGuide, getGuideProfileById);

// PUT /api/guides/:id/profile
router.put("/guides/:id/profile", protectGuide, updateGuideProfile);

// GET /api/guides/:id/dashboard
router.get("/guides/:id/dashboard", protectGuide, getGuideDashboard);

// GET /api/guides/:id/announcements
router.get("/guides/:id/announcements", protectGuide, getGuideAnnouncements);

// ----------------------------------------------------------------------
// 3. GROUPS CRUD UNDER GUIDE (Original guideRoutes.js content)
// ----------------------------------------------------------------------

router.get("/guides/:id/groups", protectGuide, getGuideGroups);
router.post("/guides/:id/groups", protectGuide, createGroupForGuide);
router.get("/guides/:id/groups/:groupId", protectGuide, getGroupByIdForGuide);
router.put("/guides/:id/groups/:groupId", protectGuide, updateGroupForGuide);
router.delete("/guides/:id/groups/:groupId", protectGuide, deleteGroupForGuide);

// ----------------------------------------------------------------------
// 4. GUIDE PANEL ROUTES (Merged from guidePanelRoutes.js)
// All routes require authenticated guide via protectGuide middleware
// The base path for these routes will be /api/guide-panel/...
// ----------------------------------------------------------------------
const guidePanelRouter = express.Router();
guidePanelRouter.use(protectGuide);

// GET /api/guide-panel/groups - list groups for current guide
guidePanelRouter.get("/groups", listGuidePanelGroups);

// GET /api/guide-panel/groups/:groupId - group details for current guide
guidePanelRouter.get("/groups/:groupId", getGuidePanelGroupDetails);

// PUT /api/guide-panel/groups/:groupId/details - update project details and members
guidePanelRouter.put("/groups/:groupId/details", updateGroupDetailsAndMembers);

// GET /api/guide-panel/students/search?enrollment=123
guidePanelRouter.get("/students/search", searchStudentsByEnrollment);

// GET /api/guide-panel/groups/:groupId/available-students
guidePanelRouter.get(
  "/groups/:groupId/available-students",
  getAvailableStudentsForGroup
);

// Project Approval routes
// GET /api/guide-panel/project-approvals
guidePanelRouter.get("/project-approvals", listProjectApprovalsForGuide);
// PUT /api/guide-panel/project-approvals/:groupId/approve
guidePanelRouter.put(
  "/project-approvals/:groupId/approve",
  approveProjectProposal
);
// PUT /api/guide-panel/project-approvals/:groupId/reject
guidePanelRouter.put(
  "/project-approvals/:groupId/reject",
  rejectProjectProposal
);

// Mount the guidePanelRouter
router.use("/guide-panel", guidePanelRouter);

// -------------------------
// 🔹 GUIDE PROJECT EVALUATION ROUTES
// -------------------------

import {
  getEvaluationParameters,
  getProjectEvaluationById,
  saveAllProjectEvaluations,
} from "../controllers/evaluationController.js";

// -------------------------
// 🔹 GUIDE EVALUATION ROUTES
// -------------------------

// GET evaluation parameters
guidePanelRouter.get(
  "/evaluation-parameters",
  protectGuide,
  getEvaluationParameters
);

// GET group evaluation details (students + marks)
guidePanelRouter.get(
  "/projects/:groupId/evaluation",
  protectGuide,
  getProjectEvaluationById
);

// POST save/update evaluation
guidePanelRouter.post(
  "/projects/:groupId/evaluate",
  protectGuide,
  saveAllProjectEvaluations
);

export default router;
