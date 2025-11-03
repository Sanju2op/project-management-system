import Notification from "../models/Notification.js";

// ➕ Create a notification
export const createNotification = async (req, res) => {
  try {
    const { type, message } = req.body;
    const notification = await Notification.create({ type, message });
    res.status(201).json({ success: true, data: notification });
  } catch (err) {
    console.error("❌ Error creating notification:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to create notification." });
  }
};

// 📩 Get all notifications (for Admin Dashboard)
export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications." });
  }
};

// ✅ Mark one notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    console.error("❌ Error marking notification as read:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark as read." });
  }
};

// ✅ Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    res
      .status(200)
      .json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    console.error("❌ Error marking all as read:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read." });
  }
};
