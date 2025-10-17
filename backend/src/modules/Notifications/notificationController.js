const service = require("./notificationService");

function getNotifications(req, res) {
  const { userId } = req.query;
  const result = service.getNotifications(userId);
  res.json(result);
}

function addNotification(req, res) {
  const { userId, message, type } = req.body;
  const newNotification = service.addNotification(userId, message, type);
  res.status(201).json(newNotification);
}

function markAsRead(req, res) {
  const { id } = req.params;
  const updated = service.markAsRead(id);
  if (updated) res.json(updated);
  else res.status(404).json({ message: "Notification not found" });
}

function deleteNotification(req, res) {
  const { id } = req.params;
  const success = service.deleteNotification(id);
  if (success) res.status(204).end();
  else res.status(404).json({ message: "Notification not found" });
}

module.exports = {
  getNotifications,
  addNotification,
  markAsRead,
  deleteNotification,
};
