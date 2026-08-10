import Notification from "../models/Notification.js";

// Get all notifications for current user
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    const mapped = notifications.map(n => {
      let type = "info";
      const title = n.title.toLowerCase();
      if (title.includes("task")) type = "task";
      else if (title.includes("leave")) type = "leave";
      else if (title.includes("invoice")) type = "invoice";
      else if (title.includes("expense")) type = "expense";

      return {
        id: n._id,
        title: n.title,
        message: n.message,
        read: n.readStatus,
        createdAt: n.createdAt,
        type,
      };
    });

    res.json({
      success: true,
      message: "Notifications fetched successfully.",
      data: mapped,
      errors: [],
      timestamp: new Date().toISOString()
    });
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
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
        data: null,
        errors: ["Notification not found."],
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read.",
      data: {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        read: notification.readStatus,
      },
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id }, { readStatus: true });
    res.json({
      success: true,
      message: "All notifications marked as read.",
      data: null,
      errors: [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
