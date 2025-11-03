import express from "express";
import {
  createNotification,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification); // for student & guide actions
router.get("/", getAllNotifications); // for admin dashboard
router.patch("/:id/read", markAsRead);
router.patch("/mark-all-read", markAllAsRead);

export default router;
