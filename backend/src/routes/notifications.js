const express = require('express');
const {
  getNotifications,
  addNotification,
  markAsRead,
  deleteNotification,
} = require('../modules/Notifications/notificationController');

const router = express.Router();

router.get('/', getNotifications);
router.post('/', addNotification);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
