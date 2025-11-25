import express from "express";
import {
  getActiveDivisions,
  getPendingEnrollments,
  registerStudent,
  loginStudent,
  checkStudentGroup,
  getAvailableStudents,
  getAssignedGuide,
  createGroup,
  getStudentProfile,
  getAllAnnouncements,
  getStudentExamSchedules,
  getGroupChatMessages,
  postGroupChatMessage,
} from "../controllers/studentController.js";

import { protectStudent } from "../middlewares/authMiddleware.js";

import {
  createRequest,
  getMyRequests,
  updateRequest,
  deleteRequest,
} from "../controllers/requestController.js";

const router = express.Router();

// Public Routes
router.get("/divisions", getActiveDivisions);
router.get("/pending-enrollments", getPendingEnrollments);
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protected Student Routes
router.get("/profile", protectStudent, getStudentProfile);
router.get("/check-group", protectStudent, checkStudentGroup);
router.get("/available-students", protectStudent, getAvailableStudents);
router.post("/create-group", protectStudent, createGroup);

// Announcements
router.get("/announcements", getAllAnnouncements);

// Exam Schedules
router.get("/exam-schedules", protectStudent, getStudentExamSchedules);

// Guide
router.get("/guide-details", protectStudent, getAssignedGuide);
router.get(
  "/group-chat/messages",
  protectStudent,
  getGroupChatMessages
);
router.post(
  "/group-chat/messages",
  protectStudent,
  postGroupChatMessage
);

// CRUD for student
router.post("/requests/create", protectStudent, createRequest);
router.get("/requests/my-requests", protectStudent, getMyRequests);
router.put("/requests/:id", protectStudent, updateRequest);
router.delete("/requests/:id", protectStudent, deleteRequest);

export default router;
