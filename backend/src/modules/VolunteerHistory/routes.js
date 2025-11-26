const express = require("express");   // <-- YOU DELETED THIS BEFORE
const router = express.Router();
const controller = require("./controller");

// Get history by email
router.get("/email/:email", controller.getHistoryByEmail);

// Get history by volunteer ID (optional)
router.get("/:volunteerId", controller.getHistoryById);

// Add history record
router.post("/", controller.addHistoryRecord);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const historyController = require('./controller');

// router.get('/:volunteerId', historyController.getVolunteerHistory);
// router.get('/stats/:volunteerId', historyController.getVolunteerStats);
// router.post('/', historyController.addHistoryRecord);

// module.exports = router;