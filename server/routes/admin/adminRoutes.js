// backend/src/routes/adminRoutes.js
import express from "express";
import {
  loginAdmin,
  registerAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
  getAdminProfile,
  updateAdminProfile,
  getAllGuides,
  createGuide,
  updateGuide,
  updateGuideStatus,
  getActiveGuides,
  deleteGuide,
  getGroupsByGuide,
  getGroupsByYearOrCourse,
  getDivisions,
  getGroupById,
  getGroups,
  getAvailableStudentsForGroup,
  getAvailableStudents,
  getStudentsByGroup,
  updateGroup,
  setGuideLimit,
  deleteGroup,
  updateGroupGuide,
  getEvaluationParams,
  updateEvaluationParam,
  addEvaluationParam,
  deleteEvaluationParam,
  getStudentEnrollments,
  updateDivisionStatus,
  addDivision,
  deleteDivision,
  generateEnrollments,
  getEnrollmentsByDivision,
  removeStudentById,
  removeAllStudentsByDivision,
  addStudentEnrollment,
  getExamSchedules,
  getCourseAnnouncements,
  getGuideAnnouncements,
  addExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  addCourseAnnouncement,
  updateCourseAnnouncement,
  deleteCourseAnnouncement,
  addGuideAnnouncement,
  updateGuideAnnouncement,
  deleteGuideAnnouncement,
  updateProjectEvaluation,
  getAllStudents,
  getStudentById,
  updateStudent,
  getGuideLimit,
  getAllNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsRead,
  getGroupProjectEvaluations,
  // updateGroupDetails,
} from "../../controllers/admin/adminController.js";

import {
  getAllProjectEvaluations,
  getProjectEvaluationById,
  saveAllProjectEvaluations,
} from "../../controllers/evaluationController.js";

import {
  getAllExpertise,
  addExpertise,
  updateExpertise,
  deleteExpertise,
} from "../../controllers/expertiseController.js";

import { protectAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/admin/login
router.post("/login", loginAdmin);

// POST /api/admin/register (optional for seeding first admin)
router.post("/register", registerAdmin);

// Forgot
router.post("/forgot-password", forgotPassword);

// Reset;
router.post("/reset-password", resetPassword);

// Protected routes (require authentication)
router.use(protectAdmin);

// GET /api/admin/profile
router.get("/profile", getAdminProfile);

// PUT /api/admin/profile
router.put("/profile", updateAdminProfile);

// Change password
router.post("/change-password", changePassword);

// Manage Guides apis
// GET /api/admin/guides -> returns list of guides
router.get("/get-all-guides", getAllGuides);

// POST /api/admin/add-guide
router.post("/add-guide", createGuide);

// PUT /api/admin/update-guide/:id
router.put("/update-guide/:id", updateGuide);

// PATCH /api/admin/new-guide-status/:id
router.patch("/new-guide-status/:id", updateGuideStatus);

// GET /api/admin/active-guides
router.get("/active-guides", getActiveGuides);

// DELETE /api/admin/guides/:id
router.delete("/guides/:id", deleteGuide);

// get groups for the guides
router.get("/admin/get-groups-by-guide/:guideId", getGroupsByGuide);

// // GET /api/admin/get-groups?year=2025
// router.get("/get-groups", getGroupsByYearOrCourse);

// GET /api/admin/get-divisions
router.get("/get-divisions", getDivisions);

// GET /api/admin/get-group/:id
router.get("/get-group/:id", getGroupById);

// GET /api/admin/get-available-students
router.get("/get-available-students", getAvailableStudents);

// GET /api/admin/get-students-by-group/:id
router.get("/get-students-by-group/:id", getStudentsByGroup);

// PUT /api/admin/update-group/:id
router.put("/update-group/:id", updateGroup);

// DELETE /api/admin/delete-group/:id
router.delete("/delete-group/:id", deleteGroup);

// GET /api/admin/get-groups (with filters)
router.get("/get-groups", getGroups);

// GET /api/admin/groups/:id/students/available
router.get(
  "/groups/:id/students/available",

  getAvailableStudentsForGroup
);

// PUT /api/admin/update-group-guide/:id
router.put("/update-group-guide/:id", updateGroupGuide);

// GET /api/admin/get-evaluation-params
router.get("/get-evaluation-params", getEvaluationParams);

// PUT /api/admin/update-evaluation-param/:id
router.put("/update-evaluation-param/:id", updateEvaluationParam);

// POST /api/admin/add-evaluation-param
router.post("/add-evaluation-param", addEvaluationParam);

// DELETE /api/admin/delete-evaluation-param/:id
router.delete(
  "/delete-evaluation-param/:id",

  deleteEvaluationParam
);

// GET /api/admin/get-student-enrollments
router.get("/get-student-enrollments", getStudentEnrollments);

// PATCH /api/admin/update-division-status/:id
router.patch("/update-division-status/:id", updateDivisionStatus);

// POST /api/admin/add-division
router.post("/add-division", addDivision);

// DELETE /api/admin/delete-division/:id
router.delete("/delete-division/:id", deleteDivision);

router.post("/generate-enrollments", generateEnrollments);

router.get(
  "/get-enrollment-by-division/:id",

  getEnrollmentsByDivision
);

// DELETE /api/admin/remove-student/:id
router.delete("/remove-student/:id", removeStudentById);

// DELETE /api/admin/remove-all-students/:id
router.delete(
  "/remove-all-students/:id",

  removeAllStudentsByDivision
);

// Add a single student enrollment
router.post("/add-student-enrollment", addStudentEnrollment);

// Exam schedules
router.get("/exam-schedules", getExamSchedules);

// POST new exam schedule
router.post("/exam-schedules", addExamSchedule);

// PUT update exam schedule
router.put("/exam-schedules/:id", updateExamSchedule);

// DELETE exam schedule
router.delete("/exam-schedules/:id", deleteExamSchedule);

// Course announcements
router.get("/course-announcements", getCourseAnnouncements);

// POST a new course announcement
router.post("/course-announcements", addCourseAnnouncement);

// PUT update a course announcement by ID
router.put("/course-announcements/:id", updateCourseAnnouncement);

// DELETE a course announcement by ID
router.delete("/course-announcements/:id", deleteCourseAnnouncement);

// Guide announcements
router.get("/guide-announcements", getGuideAnnouncements);

// POST a new guide announcement
router.post("/guide-announcements", addGuideAnnouncement);

// PUT update a guide announcement by ID
router.put("/guide-announcements/:id", updateGuideAnnouncement);

// DELETE a guide announcement by ID
router.delete("/guide-announcements/:id", deleteGuideAnnouncement);

// GET evaluation data
router.get(
  "/get-group-evaluation/:groupId",
  protectAdmin,
  getProjectEvaluationById
);
// Correct order: groupId → parameterId → studentId
router.put(
  "/project-evaluations/:groupId/:parameterId/:studentId",
  updateProjectEvaluation
);

router.put("/update-group/:groupId", updateGroup);

// DELETE /api/admin/groups/:id
router.delete("/groups/:id", deleteGroup);

// Student management routes
// GET /api/admin/students
router.get("/students", getAllStudents);

// GET /api/admin/students/:id
router.get("/students/:id", getStudentById);

// PUT /api/admin/students/:id
router.put("/students/:id", updateStudent);

// DELETE /api/admin/students/:id
router.delete("/students/:id", removeStudentById);

router.put("/set-guide-limit", setGuideLimit);

router.get("/get-guide-limit", getGuideLimit);

// ✅ Notification routes
router.get("/notifications", getAllNotifications);
router.post("/notifications", createNotification);
router.patch("/notifications/:id/read", markNotificationAsRead);
router.patch("/notifications/mark-all-read", markAllNotificationsRead);

// GET all parameters
// // Parameters
// router.get("/get-evaluation-params", protectAdmin, getEvaluationParameters);
router.post(
  "/save-all-project-evaluations/:groupId",
  protectAdmin,
  saveAllProjectEvaluations
);
// GET /api/admin/get-all-evaluations → returns EVERY evaluation for PDF
router.get("/get-all-evaluations", protectAdmin, getAllProjectEvaluations);

// GET /api/admin/groups/:groupId/project-evaluations
router.get("/groups/:groupId/project-evaluations", getGroupProjectEvaluations);

// 🧠 Expertise Management Routes
router.get("/expertise", protectAdmin, getAllExpertise);
router.post("/expertise", protectAdmin, addExpertise);
router.put("/expertise/:id", protectAdmin, updateExpertise);
router.delete("/expertise/:id", protectAdmin, deleteExpertise);

export default router;
