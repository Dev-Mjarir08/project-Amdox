import Notification from "../models/Notification.js";

// Get all notifications for current user
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const mapped = notifications.map(n => ({
      id: n._id,
      title: n.title,
      message: n.message,
      read: n.readStatus,
      createdAt: n.createdAt,
    }));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { readStatus: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    res.json({
      id: notification._id,
      title: notification.title,
      message: notification.message,
      read: notification.readStatus,
    });
  } catch (err) {
    next(err);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { readStatus: true });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
