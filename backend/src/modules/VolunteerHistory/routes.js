// backend/src/modules/VolunteerHistory/routes.js
const express = require("express");
const router = express.Router();
const controller = require("./controller");

router.get("/:volunteerId", controller.getHistory);
router.post("/", controller.addHistory);
router.get("/stats/:volunteerId", controller.getStats);
router.patch("/:id", controller.updateHistory); // ✅ NEW
router.get("/ping", controller.ping);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const controller = require("./controller");

// // ⚠️ Order matters: put /stats before /:volunteerId to avoid route shadowing
// router.get("/stats/:volunteerId", controller.getStats);
// router.get("/ping", controller.ping);

// // Core CRUD-ish routes
// router.get("/:volunteerId", controller.getHistory);
// router.post("/", controller.addHistory);

// // Optional admin action to mark a record complete
// router.patch("/:id/complete", controller.markComplete);

// module.exports = router;

// // backend/src/modules/VolunteerHistory/routes.js
// const express = require("express");
// const router = express.Router();
// const controller = require("./controller"); // ✅ import entire controller object

// // Define routes safely
// router.get("/stats/:volunteerId", controller.getStats);
// router.get("/:volunteerId", controller.getHistory);
// router.post("/", controller.addHistory);
// router.get("/ping", controller.ping);
// //router.patch("/:id/complete", controller.markComplete);

// module.exports = router;


// // backend/src/modules/VolunteerMatching/routes.js
// const express = require("express");
// const router = express.Router();

// const {
//   findMatches,
//   createMatch,
//   autoAssign
// } = require("./controller");

// // ✅ Find volunteers for an event
// router.get("/event/:eventId", findMatches);

// // ✅ Create a manual match (assign volunteer)
// router.post("/", createMatch);

// // ✅ Auto-assign top volunteers
// router.post("/event/:eventId/auto", autoAssign);

// // Optional test route
// router.get("/test", (req, res) => {
//   res.json({ success: true, message: "VolunteerMatching routes.js loaded successfully!" });
// });

// module.exports = router;

// // backend/src/modules/VolunteerHistory/routes.js
// const express = require('express');
// const router = express.Router();
// const { getHistory, addHistory, getStats, ping } = require('./controller');

// console.log('🧾 VolunteerHistory routes.js loaded successfully!');

// // Health/ping
// router.get('/test', ping);

// // Get history for a volunteer
// router.get('/:volunteerId', getHistory);

// // Stats for a volunteer
// router.get('/stats/:volunteerId', getStats);

// // Add a record
// router.post('/', addHistory);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const historyController = require('./controller');

// router.get('/:volunteerId', historyController.getVolunteerHistory);
// router.get('/stats/:volunteerId', historyController.getVolunteerStats);
// router.post('/', historyController.addHistoryRecord);

// module.exports = router;