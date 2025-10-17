const { notifications } = require("./notificationData");

function getNotifications(userId) {
  return notifications.filter((n) => n.userId === userId);
}

function addNotification(userId, message, type = "info") {
  const newNotification = {
    id: (notifications.length + 1).toString(),
    userId,
    message,
    type,
    read: false,
    timestamp: new Date().toISOString(),
  };
  notifications.push(newNotification);
  return newNotification;
}

function markAsRead(id) {
  const notification = notifications.find((n) => n.id === id);
  if (notification) {
    notification.read = true;
    return notification;
  }
  return null;
}

function deleteNotification(id) {
  const index = notifications.findIndex((n) => n.id === id);
  if (index > -1) {
    notifications.splice(index, 1);
    return true;
  }
  return false;
}

module.exports = {
  getNotifications,
  addNotification,
  markAsRead,
  deleteNotification,
};
