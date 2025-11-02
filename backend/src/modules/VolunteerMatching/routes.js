// backend/src/modules/VolunteerMatching/routes.js
const express = require("express");
const router = express.Router();
const {
  findMatches,
  createMatch,
  autoAssign
} = require("./controller");

// ✅ Fetch volunteer matches for an event
router.get("/event/:eventId", findMatches);

// ✅ Create a manual match
router.post("/", createMatch);

// ✅ Auto-assign volunteers
router.post("/event/:eventId/auto", autoAssign);

// ✅ Get all assigned volunteers for a specific event
router.get("/event/:eventId/assigned", require("./controller").listAssigned);

// ✅ Quick test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "VolunteerMatching routes.js loaded successfully!",
  });
});

module.exports = router;



// // backend/src/modules/VolunteerMatching/routes.js
// const express = require("express");
// const router = express.Router();
// const controller = require("./controller");

// console.log("🧩 VolunteerMatching routes.js loaded successfully!");

// // 🔹 Find matches for a given event
// router.get("/event/:eventId", controller.getMatchesForEvent);

// // 🔹 Assign volunteer to event
// router.post("/", controller.assignVolunteer);

// // 🔹 (Optional) List all volunteer-event matches
// router.get("/", controller.listAllMatches);

// module.exports = router;

// // backend/src/modules/VolunteerMatching/routes.js
// const express = require('express');
// const router = express.Router();
// const { findMatches, createMatch, listEvents } = require('./controller');

// console.log('🧩 VolunteerMatching routes.js loaded successfully!');

// // For convenience, expose events through matching too (frontend uses /events normally)
// router.get('/events', listEvents);

// // Find matches for an event
// router.get('/event/:eventId', findMatches);

// // Create a match (and write to volunteer_history)
// router.post('/', createMatch);

// // A tiny ping endpoint (optional)
// router.get('/test', (_req, res) => {
//   res.json({ success: true, message: 'VolunteerMatching routes connected.' });
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const matchingController = require('./controller');

// router.get('/event/:eventId', matchingController.findMatches);
// router.post('/', matchingController.createMatch);

// module.exports = router;