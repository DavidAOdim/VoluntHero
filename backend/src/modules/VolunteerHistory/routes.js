const express = require('express');
const router = express.Router();
const volunteerHistoryController = require('./controller');

// Volunteer routes
router.get('/volunteer/:volunteerId', volunteerHistoryController.getVolunteerHistory);
router.get('/volunteer/:volunteerId/stats', volunteerHistoryController.getVolunteerStats);
router.post('/register', volunteerHistoryController.registerForEvent);

// Event-specific routes
router.get('/event/:eventId/volunteers', volunteerHistoryController.getEventVolunteers);

// Admin routes
router.get('/', volunteerHistoryController.getAllHistory);
router.get('/recent', volunteerHistoryController.getRecentActivity);
router.get('/platform-stats', volunteerHistoryController.getPlatformStats);
router.put('/:historyId', volunteerHistoryController.updateParticipation);

module.exports = router;