// backend/src/modules/VolunteerMatching/controller.js
const matchingService = require("./service");
const historyService = require("../VolunteerHistory/service");
const db = require("../../utils/dbConnect");

// ✅ Get volunteer matches for a given event
async function findMatches(req, res) {
  const { eventId } = req.params;
  try {
    const matches = await matchingService.findVolunteerMatches(eventId);
    res.json({
      success: true,
      data: matches,
      message: `${matches.length} matches found for event`,
    });
  } catch (error) {
    console.error("Error finding matches:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// ✅ Manually assign a volunteer to an event
async function createMatch(req, res) {
  const { volunteerId, eventId } = req.body;
  try {
    const match = await matchingService.createVolunteerMatch(volunteerId, eventId);
    res.json({
        success: true,
        data: match,
        message: "Volunteer successfully assigned and recorded in history",
    });

    // const match = await matchingService.createVolunteerMatch(volunteerId, eventId);
    // await historyService.addHistoryRecord(volunteerId, eventId, "registered", 0, "");
    // res.json({
    //   success: true,
    //   data: match,
    //   message: "Volunteer successfully assigned and history updated",
    // });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

// ✅ Auto-assign top volunteers for an event
async function autoAssign(req, res) {
  const { eventId } = req.params;
  const top = parseInt(req.query.top || "2", 10);
  const min = parseFloat(req.query.min || "0.4");

  try {
    const matches = await matchingService.findVolunteerMatches(eventId);
    const filtered = matches.filter(m => m.matchScore >= min).slice(0, top);
    const assigned = [];

    for (const m of filtered) {
      await matchingService.createVolunteerMatch(m.volunteer.id, eventId);
      await historyService.addHistoryRecord(m.volunteer.id, eventId, "registered", 0, "");
      assigned.push({
        volunteerId: m.volunteer.id,
        name: m.volunteer.name,
        score: m.matchScore,
        matchingSkills: m.matchingSkills,
      });
    }

    res.json({
      success: true,
      assigned,
      message: `Auto-assigned ${assigned.length} volunteer(s)`,
    });
  } catch (error) {
    console.error("Error auto-assigning volunteers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
// ✅ List already assigned volunteers for an event
async function listAssigned(req, res) {
  const { eventId } = req.params;
  try {
    const [rows] = await db.promise().query(
      `SELECT volunteerId, volunteerName, participationStatus, hoursVolunteered, skillsUsed
       FROM volunteer_history
       WHERE eventId = ?
       ORDER BY createdAt DESC`,
      [eventId]
    );

    const formatted = rows.map(r => ({
      ...r,
      skillsUsed: (() => {
        try {
          const parsed = JSON.parse(r.skillsUsed || "[]");
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })()
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
      message: `${formatted.length} assigned volunteer(s) found for event`
    });
  } catch (err) {
    console.error("Error listing assigned volunteers:", err);
    res.status(500).json({
      success: false,
      message: "Failed to list assigned volunteers: " + err.message
    });
  }
}

module.exports = { findMatches, createMatch, autoAssign, listAssigned };


// // backend/src/modules/VolunteerMatching/controller.js
// const path = require("path");
// const matchingService = require("./service");
// const historyService = require("../VolunteerHistory/service");
// //const db = require(path.resolve(__dirname, "../../../db"));
// const db = require("../../utils/dbConnection");

// // ✅ Find volunteers for a specific event
// async function findMatches(req, res) {
//   const { eventId } = req.params;
//   try {
//     const data = await matchingService.findVolunteerMatches(eventId);
//     res.json({ success: true, data, message: `${data.length} matches found for event` });
//   } catch (error) {
//     console.error("Error finding matches:", error);
//     res.status(500).json({ success: false, message: "Error fetching matches" });
//   }
// }

// // ✅ Create a single volunteer match (and update history)
// async function createMatch(req, res) {
//   const { volunteerId, eventId } = req.body;
//   try {
//     const match = await matchingService.createVolunteerMatch(volunteerId, eventId);

//     // Automatically add to volunteer history
//     await historyService.addHistoryRecord(volunteerId, eventId, "registered", 0, "");

//     res.json({
//       success: true,
//       message: "Volunteer assigned and history updated successfully",
//       data: match,
//     });
//   } catch (error) {
//     console.error("Error creating match:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

// // ✅ Auto-assign top volunteers and record in history
// async function autoAssign(req, res) {
//   const { eventId } = req.params;
//   const top = parseInt(req.query.top || "2", 10);
//   const min = parseFloat(req.query.min || "0.4");

//   try {
//     const matches = await matchingService.findVolunteerMatches(eventId);
//     const filtered = matches.filter((m) => m.matchScore >= min).slice(0, top);

//     const assigned = [];
//     for (const m of filtered) {
//       await matchingService.createVolunteerMatch(m.volunteer.id, eventId);
//       await historyService.addHistoryRecord(
//         m.volunteer.id,
//         eventId,
//         "registered",
//         0,
//         ""
//       );
//       assigned.push({
//         volunteerId: m.volunteer.id,
//         name: m.volunteer.name,
//         score: m.matchScore,
//         matchingSkills: m.matchingSkills,
//         created: true,
//       });
//     }

//     res.json({
//       success: true,
//       assigned,
//       message: `Auto-assigned ${assigned.length} volunteer(s)`,
//     });
//   } catch (error) {
//     console.error("Error auto-assigning volunteers:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// }

// module.exports = {
//   findMatches,
//   createMatch,
//   autoAssign,
// };

// // backend/src/modules/VolunteerMatching/controller.js
// const path = require("path");
// //const db = require(path.resolve(__dirname, "../../../../db"));
// const db = require("../../utils/dbConnect");

// const matchingService = require("./service");

// class VolunteerMatchingController {
//   // 🔹 Get matches for a specific event
//   async getMatchesForEvent(req, res) {
//     try {
//       const { eventId } = req.params;
//       const result = await matchingService.findVolunteerMatches(eventId);
//       res.json(result); // result is already formatted
//     } catch (error) {
//       console.error("Error in getMatchesForEvent:", error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   // 🔹 Assign a volunteer to an event
//   async assignVolunteer(req, res) {
//     try {
//       const { volunteerId, eventId } = req.body;
//       if (!volunteerId || !eventId)
//         return res
//           .status(400)
//           .json({ success: false, message: "volunteerId and eventId required" });

//       const result = await matchingService.createVolunteerMatch(
//         volunteerId,
//         eventId
//       );
//       res.json(result);
//     } catch (error) {
//       console.error("Error in assignVolunteer:", error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }

//   // 🔹 Optional: Get all matches (from volunteer_history)
//   async listAllMatches(req, res) {
//     try {
//       const [rows] = await require("../../../db")
//         .promise()
//         .query(
//           "SELECT * FROM volunteer_history ORDER BY eventDate DESC, id DESC"
//         );

//       res.json({ success: true, data: rows });
//     } catch (error) {
//       console.error("Error listing matches:", error);
//       res.status(500).json({ success: false, message: error.message });
//     }
//   }
// }

// module.exports = new VolunteerMatchingController();


// // // backend/src/modules/VolunteerMatching/controller.js
// // const service = require('./service');

// // exports.findMatches = async (req, res) => {
// //   try {
// //     const { eventId } = req.params;
// //     const matches = await service.findVolunteerMatches(eventId);
// //     res.json({ success: true, data: matches });
// //   } catch (err) {
// //     console.error('findMatches error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // exports.createMatch = async (req, res) => {
// //   try {
// //     const { volunteerId, eventId } = req.body;
// //     if (!volunteerId || !eventId) {
// //       return res.status(400).json({ success: false, message: 'volunteerId and eventId are required' });
// //     }
// //     const result = await service.createVolunteerMatch(volunteerId, eventId);
// //     res.status(201).json(result);
// //   } catch (err) {
// //     console.error('createMatch error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // exports.listEvents = async (_req, res) => {
// //   try {
// //     const events = await service.getEvents();
// //     res.json(events);
// //   } catch (err) {
// //     console.error('listEvents error:', err);
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // const volunteerMatchingService = require('./service');

// // const findMatches = async (req, res) => {
// //     try {
// //         const { eventId } = req.params;
// //         const matches = await volunteerMatchingService.findVolunteerMatches(eventId);
        
// //         res.json({
// //             success: true,
// //             message: "Volunteer matches retrieved successfully",
// //             data: matches
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             success: false,
// //             message: error.message
// //         });
// //     }
// // };

// // const createMatch = async (req, res) => {
// //     try {
// //         const { volunteerId, eventId } = req.body;
// //         const match = await volunteerMatchingService.createVolunteerMatch(volunteerId, eventId);
        
// //         res.json({
// //             success: true,
// //             message: "Volunteer successfully matched to event",
// //             data: match
// //         });
// //     } catch (error) {
// //         res.status(500).json({
// //             success: false,
// //             message: error.message
// //         });
// //     }
// // };

// // module.exports = { findMatches, createMatch };