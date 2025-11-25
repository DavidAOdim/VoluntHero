const express = require("express");
const router = express.Router();
const controller = require("../controllers/reportController");

router.get("/volunteers", controller.getVolunteerReport);
router.get("/volunteers/csv", controller.getVolunteerCSV);
router.get("/volunteers/pdf", controller.getVolunteerPDF);

router.get("/events", controller.getEventReport);
router.get("/events/csv", controller.getEventCSV);
router.get("/events/pdf", controller.getEventPDF);

module.exports = router;
