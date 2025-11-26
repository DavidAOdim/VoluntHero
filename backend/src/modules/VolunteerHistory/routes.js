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



