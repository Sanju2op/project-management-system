import express from "express";
import {
  getActiveDivisions,
  getPendingEnrollments,
  registerStudent,
  loginStudent,
  checkStudentGroup,
  getAvailableStudents,
  createGroup,
  getStudentProfile,
  getAllAnnouncements,
  getStudentExamSchedules,
} from "../controllers/studentController.js";
import { protectStudent } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/divisions", getActiveDivisions);
router.get("/pending-enrollments", getPendingEnrollments);
router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Protected routes
router.get("/profile", protectStudent, getStudentProfile);
router.get("/check-group", protectStudent, checkStudentGroup);
router.get("/available-students", protectStudent, getAvailableStudents);
router.post("/create-group", protectStudent, createGroup);

router.get("/announcements", getAllAnnouncements);

router.get("/exam-schedules", protectStudent, getStudentExamSchedules);

export default router;
