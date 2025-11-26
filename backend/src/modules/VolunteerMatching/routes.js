// backend/src/modules/VolunteerMatching/routes.js
const express = require("express");
const router = express.Router();
const controller = require("./controller");

// GET matches for an event
router.get("/event/:eventId", controller.getMatches);

// ASSIGN a volunteer to an event
router.post("/", controller.assign);

// GET already assigned volunteers for an event
router.get("/assigned/:eventId", controller.getAssigned);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const controller = require("./controller");

// router.get("/event/:eventId", controller.findMatches);
// router.get("/assigned/:eventId", controller.getAssignedVolunteers);
// router.post("/assign", controller.assignVolunteer);

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const controller = require("./controller");

// router.get("/event/:eventId", controller.findMatches);
// router.post("/", controller.assign);
// router.get("/assigned/:eventId", controller.getAssigned);
//  router.post("/", controller.assign);
// router.post("/assign", controller.assign); // <-- ADD THIS

// module.exports = router;

// const express = require("express");
// const router = express.Router();

// const {
//   getMatchesForEvent,
//   assignVolunteer,
//   getAssignedVolunteers
// } = require("./controller");

// router.get("/event/:eventId", getMatchesForEvent);
// router.post("/", assignVolunteer);
// router.get("/assigned/:eventId", getAssignedVolunteers);

// module.exports = router;

// const router = require("express").Router();
// const controller = require("./controller");

// router.get("/event/:eventId", controller.findMatches);
// router.post("/", controller.createMatch);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const matchingController = require('./controller');

// router.get('/event/:eventId', matchingController.findMatches);
// router.post('/', matchingController.createMatch);

// module.exports = router;