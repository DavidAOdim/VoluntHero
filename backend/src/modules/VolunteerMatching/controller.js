// backend/src/modules/VolunteerMatching/controller.js
const service = require("./service");

// GET matches for event
exports.getMatches = async (req, res) => {
  try {
    const { eventId } = req.params;
    const matches = await service.findMatches(eventId);

    res.json({ success: true, matches });
  } catch (err) {
    console.error("❌ Error getMatches:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ASSIGN volunteer
exports.assign = async (req, res) => {
  try {
    const { volunteerEmail, volunteerName, eventId } = req.body;

    if (!volunteerEmail || !volunteerName || !eventId) {
      return res.status(400).json({
        success: false,
        message: "Missing volunteerEmail / volunteerName / eventId",
      });
    }

    console.log("📩 Assign request:", { volunteerEmail, volunteerName, eventId });

    const id = await service.assignVolunteer(volunteerEmail, volunteerName, eventId);

    res.json({
      success: true,
      message: "Volunteer assigned successfully",
      id,
    });
  } catch (err) {
    console.error("❌ Error assign:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET already assigned
exports.getAssigned = async (req, res) => {
  try {
    const { eventId } = req.params;
    const assigned = await service.getAssigned(eventId);

    res.json({ success: true, assigned });
  } catch (err) {
    console.error("❌ Error getAssigned:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// // backend/src/modules/VolunteerMatching/controller.js
// const service = require("./service");

// exports.getMatches = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const matches = await service.findMatches(eventId);

//     res.json({ success: true, matches });
//   } catch (err) {
//     console.error("❌ Error getMatches:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.assign = async (req, res) => {
//   try {
//     const { volunteerEmail, volunteerName, eventId } = req.body;

//     if (!volunteerEmail || !volunteerName || !eventId) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields (email/name/eventId)",
//       });
//     }

//     const record = await service.assignVolunteer(volunteerEmail, volunteerName, eventId);

//     res.json({
//       success: true,
//       message: "Volunteer assigned successfully",
//       record,
//     });
//   } catch (err) {
//     console.error("❌ Error assign:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getAssigned = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const assigned = await service.getAssigned(eventId);

//     res.json({ success: true, assigned });
//   } catch (err) {
//     console.error("❌ Error getAssigned:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// // backend/src/modules/VolunteerMatching/controller.js
// const db = require("../../../../db");
// const service = require("./service");

// // 1. GET MATCHES
// exports.getMatches = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     const matches = await service.findMatches(eventId);
//     res.json({ success: true, matches });
//   } catch (err) {
//     console.error("❌ Error getMatches:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 2. ASSIGN VOLUNTEER
// exports.assign = async (req, res) => {
//   try {
//     const { volunteerId, eventId } = req.body;

//     if (!volunteerId || !eventId) {
//       return res.status(400).json({ message: "Missing volunteerId/eventId" });
//     }

//     const record = await service.assignVolunteer(volunteerId, eventId);

//     res.json({
//       success: true,
//       message: "Volunteer assigned successfully",
//       record,
//     });
//   } catch (err) {
//     console.error("❌ Error in assign:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // 3. GET ALREADY ASSIGNED
// exports.getAssigned = async (req, res) => {
//   try {
//     const { eventId } = req.params;

//     const [rows] = await db.query(
//       `
//       SELECT *
//       FROM volunteer_history
//       WHERE eventId = ?
//       ORDER BY createdAt DESC
//       `,
//       [eventId]
//     );

//     res.json({ success: true, assigned: rows });
//   } catch (err) {
//     console.error("❌ Error getAssigned:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// const service = require("./service");

// exports.getMatches = async (req, res) => {
//   try {
//     const results = await service.findMatches(req.params.eventId);
//     res.json({ matches: results });
//   } catch (err) {
//     console.error("MATCH ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.assign = async (req, res) => {
//   try {
//     const { volunteerEmail, eventId } = req.body;

//     if (!volunteerEmail || !eventId)
//       return res.status(400).json({ error: "Missing required fields" });

//     await service.assign(volunteerEmail, eventId);
//     res.json({ success: true });
//   } catch (err) {
//     console.error("ASSIGN ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getAssigned = async (req, res) => {
//   try {
//     const assigned = await service.getAssigned(req.params.eventId);
//     res.json({ assigned });
//   } catch (err) {
//     console.error("ASSIGNED ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };






// // backend/src/modules/VolunteerMatching/controller.js

// const service = require("./service");

// // GET /matching/event/:eventId
// async function findMatches(req, res) {
//   try {
//     const matches = await service.findMatchesForEvent(req.params.eventId);
//     res.json({ success: true, data: matches });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// // POST /matching
// async function assign(req, res) {
//   try {
//     const { volunteerId, eventId } = req.body;
//     const result = await service.assignVolunteer(volunteerId, eventId);
//     res.json({ success: true, data: result });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// // GET /matching/assigned/:eventId
// async function getAssigned(req, res) {
//   try {
//     const rows = await service.getAssignedVolunteers(req.params.eventId);
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// module.exports = { findMatches, assign, getAssigned };

// // backend/src/modules/VolunteerMatching/controller.js

// const matchingService = require("./service");

// // GET /matching/event/:eventId
// async function findMatches(req, res) {
//   try {
//     const { eventId } = req.params;

//     const matches = await matchingService.findMatchesForEvent(eventId);

//     res.json({
//       success: true,
//       message: "Matches fetched successfully",
//       data: matches,
//     });
//   } catch (err) {
//     console.error("Error in findMatches:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch matches",
//       error: err.message,
//     });
//   }
// }

// // POST /matching
// // body: { volunteerId, eventId }
// // volunteerId = UserCredentials.id
// async function assign(req, res) {
//   try {
//     const { volunteerId, eventId } = req.body;

//     if (!volunteerId || !eventId) {
//       return res.status(400).json({
//         success: false,
//         message: "volunteerId and eventId are required",
//       });
//     }

//     const record = await matchingService.assignVolunteer(
//       volunteerId,
//       eventId
//     );

//     res.json({
//       success: true,
//       message: "Volunteer assigned successfully",
//       data: record,
//     });
//   } catch (err) {
//     console.error("Error in assign:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to assign volunteer",
//       error: err.message,
//     });
//   }
// }

// // GET /matching/assigned/:eventId
// async function getAssigned(req, res) {
//   try {
//     const { eventId } = req.params;

//     const assigned = await matchingService.getAssignedVolunteers(eventId);

//     res.json({
//       success: true,
//       message: "Assigned volunteers fetched successfully",
//       data: assigned,
//     });
//   } catch (err) {
//     console.error("Error in getAssigned:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch assigned volunteers",
//       error: err.message,
//     });
//   }
// }

// module.exports = {
//   findMatches,
//   assign,
//   getAssigned,
// };

// // backend/src/modules/VolunteerMatching/controller.js

// const matchingService = require("./service");

// // GET /matching/event/:eventId
// async function findMatches(req, res) {
//   try {
//     const { eventId } = req.params;
//     const matches = await matchingService.findMatchesForEvent(eventId);
//     res.json({ success: true, data: matches });
//   } catch (err) {
//     console.error("Error in findMatches:", err);
//     res
//       .status(500)
//       .json({ success: false, message: err.message || "Server error" });
//   }
// }

// // POST /matching
// // body: { volunteerId, eventId }
// async function assign(req, res) {
//   try {
//     const { volunteerId, eventId } = req.body;

//     if (!volunteerId || !eventId) {
//       return res.status(400).json({
//         success: false,
//         message: "volunteerId and eventId are required",
//       });
//     }

//     const result = await matchingService.assignVolunteer(
//       volunteerId,
//       eventId
//     );

//     res.json({
//       success: true,
//       message: "Volunteer assigned and history recorded",
//       data: result,
//     });
//   } catch (err) {
//     console.error("Error in assign:", err);
//     res
//       .status(500)
//       .json({ success: false, message: err.message || "Server error" });
//   }
// }

// // GET /matching/assigned/:eventId
// async function getAssigned(req, res) {
//   try {
//     const { eventId } = req.params;
//     const assigned = await matchingService.getAssignedVolunteers(eventId);
//     res.json({ success: true, data: assigned });
//   } catch (err) {
//     console.error("Error in getAssigned:", err);
//     res
//       .status(500)
//       .json({ success: false, message: err.message || "Server error" });
//   }
// }

// module.exports = {
//   findMatches,
//   assign,
//   getAssigned,
// };


// const db = require("../../../../db");
// const matchingService = require("./service");

// async function assign(req, res) {
//   try {
//     const { volunteerId, eventId } = req.body;

//     // Insert the assignment record into volunteer_history
//     const [eventRows] = await db.query(
//       "SELECT title, date, location FROM events WHERE id = ?",
//       [eventId]
//     );

//     const event = eventRows[0];

//     const [volRows] = await db.query(
//       "SELECT name FROM volunteers WHERE id = ?",
//       [volunteerId]
//     );

//     const volunteer = volRows[0];

//     await db.query(
//       `INSERT INTO volunteer_history
//         (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
//          participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//        VALUES (?, ?, ?, ?, ?, ?, 'assigned', 0, '[]', '', 0)`,
//       [
//         volunteerId,
//         volunteer.name,
//         eventId,
//         event.title,
//         event.date,
//         event.location
//       ]
//     );

//     res.json({ success: true, message: "Volunteer assigned!" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// module.exports = { assign };


// // backend/src/modules/VolunteerMatching/controller.js

// const matchingService = require("./service");

// // GET /matching/event/:eventId
// async function findMatches(req, res) {
//   try {
//     const { eventId } = req.params;
//     const matches = await matchingService.findMatchesForEvent(eventId);
//     res.json({ success: true, data: matches });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// // POST /matching
// async function assign(req, res) {
//   try {
//     const { volunteerId, eventId } = req.body;

//     const assigned = await matchingService.assignVolunteer(volunteerId, eventId);

//     // Also insert into volunteer history
//     const eventDate = new Date().toISOString().slice(0, 10);

//     await db.query(
//       `INSERT INTO volunteer_history 
//        (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
//         participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//        VALUES (?, ?, ?, ?, ?, ?, 'registered', 0, ?, '', 0)`,
//       [
//         volunteerId,
//         `Volunteer ${volunteerId}`,
//         eventId,
//         `Event ${eventId}`,
//         eventDate,
//         "Unknown",
//         JSON.stringify([])
//       ]
//     );

//     res.json({ success: true, data: assigned });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// // GET /matching/assigned/:eventId
// async function getAssigned(req, res) {
//   try {
//     const { eventId } = req.params;
//     const assigned = await matchingService.getAssignedVolunteers(eventId);
//     res.json({ success: true, data: assigned });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// }

// module.exports = {
//   findMatches,
//   assign,
//   getAssigned
// };

