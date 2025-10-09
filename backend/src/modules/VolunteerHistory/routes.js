const express = require('express');
const router = express.Router();
const historyController = require('./controller');

router.get('/:volunteerId', historyController.getVolunteerHistory);
router.get('/stats/:volunteerId', historyController.getVolunteerStats);
router.post('/', historyController.addHistoryRecord);

module.exports = router;