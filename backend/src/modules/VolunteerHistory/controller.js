const db = require("../../../../db");

// GET history by email
exports.getHistoryByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM volunteer_history WHERE volunteerEmail = ? ORDER BY createdAt DESC`,
      [email]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getHistoryByEmail error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET history by volunteerId
exports.getHistoryById = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM volunteer_history WHERE volunteerId = ? ORDER BY createdAt DESC`,
      [volunteerId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ getHistoryById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADD history record
exports.addHistoryRecord = async (req, res) => {
  try {
    const {
      volunteerEmail,
      volunteerId,
      volunteerName,
      eventId,
      eventName,
      eventDate,
      eventLocation,
      participationStatus = "registered",
      hoursVolunteered = 0,
      skillsUsed = "[]",
      feedback = "",
      rating = 0,
    } = req.body;

    const [result] = await db.query(
      `
        INSERT INTO volunteer_history (
          volunteerEmail, volunteerId, volunteerName, eventId,
          eventName, eventDate, eventLocation,
          participationStatus, hoursVolunteered, skillsUsed,
          feedback, rating
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        volunteerEmail,
        volunteerId,
        volunteerName,
        eventId,
        eventName,
        eventDate,
        eventLocation,
        participationStatus,
        hoursVolunteered,
        skillsUsed,
        feedback,
        rating,
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ addHistoryRecord error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// // backend/src/modules/VolunteerHistory/controller.js
// const db = require("../../../../db");

// exports.getVolunteerHistory = async (req, res) => {
//   const { email } = req.params;

//   try {
//     const [rows] = await db.query(
//       "SELECT * FROM volunteer_history WHERE volunteerName = (SELECT fullName FROM UserProfile WHERE email = ?) ORDER BY eventDate DESC",
//       [email]
//     );

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error("History error:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };



// const db = require("../../../../db");

// exports.getVolunteerHistory = async (req, res) => {
//   try {
//     const { email } = req.params;

//     const [rows] = await db.query(
//       `SELECT * FROM volunteer_history WHERE volunteerEmail = ? ORDER BY eventDate DESC`,
//       [email]
//     );

//     res.json({
//       success: true,
//       data: rows.map((r) => ({
//         ...r,
//         skillsUsed: r.skillsUsed ? JSON.parse(r.skillsUsed) : [],
//       })),
//     });
//   } catch (err) {
//     console.error("Error loading volunteer history:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// // backend/src/modules/VolunteerHistory/controller.js

// const volunteerHistoryService = require("./service");

// const getVolunteerHistory = async (req, res) => {
//   try {
//     const { volunteerId } = req.params;
//     const history = await volunteerHistoryService.getVolunteerHistory(volunteerId);

//     res.json({
//       success: true,
//       message: "Volunteer history retrieved successfully",
//       data: history,
//     });
//   } catch (error) {
//     console.error("Error in getVolunteerHistory:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// const addHistoryRecord = async (req, res) => {
//   try {
//     const { volunteerId, eventId, participationStatus, hours, feedback } = req.body;

//     const record = await volunteerHistoryService.addHistoryRecord(
//       volunteerId,
//       eventId,
//       participationStatus,
//       hours,
//       feedback
//     );

//     res.json({
//       success: true,
//       message: "History record added successfully",
//       data: record,
//     });
//   } catch (error) {
//     console.error("Error in addHistoryRecord:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// const getVolunteerStats = async (req, res) => {
//   try {
//     const { volunteerId } = req.params;

//     const stats = await volunteerHistoryService.getVolunteerStats(volunteerId);

//     res.json({
//       success: true,
//       message: "Volunteer statistics retrieved successfully",
//       data: stats,
//     });
//   } catch (error) {
//     console.error("Error in getVolunteerStats:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = { getVolunteerHistory, addHistoryRecord, getVolunteerStats };

// // backend/src/modules/VolunteerHistory/controller.js

// const volunteerHistoryService = require("./service");

// // GET /history/:userId
// const getVolunteerHistory = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const history = await volunteerHistoryService.getVolunteerHistory(userId);

//     res.json({
//       success: true,
//       message: "Volunteer history retrieved successfully",
//       data: history
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // POST /history
// const addHistoryRecord = async (req, res) => {
//   try {
//     const { userId, eventId, participationStatus, hours, feedback } = req.body;

//     const record = await volunteerHistoryService.addHistoryRecord(
//       userId,
//       eventId,
//       participationStatus,
//       hours,
//       feedback
//     );

//     res.json({
//       success: true,
//       message: "History record added successfully",
//       data: record
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// // GET /history/stats/:userId
// const getVolunteerStats = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const stats = await volunteerHistoryService.getVolunteerStats(userId);

//     res.json({
//       success: true,
//       message: "Volunteer statistics retrieved successfully",
//       data: stats
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// module.exports = { getVolunteerHistory, addHistoryRecord, getVolunteerStats };


// const volunteerHistoryService = require('./service');

// const getVolunteerHistory = async (req, res) => {
//     try {
//         const { volunteerId } = req.params;
//         const history = await volunteerHistoryService.getVolunteerHistory(volunteerId);
        
//         res.json({
//             success: true,
//             message: "Volunteer history retrieved successfully",
//             data: history
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const addHistoryRecord = async (req, res) => {
//     try {
//         const { volunteerId, eventId, participationStatus, hours, feedback } = req.body;
//         const record = await volunteerHistoryService.addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback);
        
//         res.json({
//             success: true,
//             message: "History record added successfully",
//             data: record
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const getVolunteerStats = async (req, res) => {
//     try {
//         const { volunteerId } = req.params;
//         const stats = await volunteerHistoryService.getVolunteerStats(volunteerId);
        
//         res.json({
//             success: true,
//             message: "Volunteer statistics retrieved successfully",
//             data: stats
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// module.exports = { getVolunteerHistory, addHistoryRecord, getVolunteerStats };

// const volunteerHistoryService = require('./service');

// const getVolunteerHistory = async (req, res) => {
//     try {
//         const { volunteerId } = req.params;
//         const history = await volunteerHistoryService.getVolunteerHistory(volunteerId);
        
//         res.json({
//             success: true,
//             message: "Volunteer history retrieved successfully",
//             data: history
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const addHistoryRecord = async (req, res) => {
//     try {
//         const { volunteerId, eventId, participationStatus, hours, feedback } = req.body;
//         const record = await volunteerHistoryService.addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback);
        
//         res.json({
//             success: true,
//             message: "History record added successfully",
//             data: record
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// const getVolunteerStats = async (req, res) => {
//     try {
//         const { volunteerId } = req.params;
//         const stats = await volunteerHistoryService.getVolunteerStats(volunteerId);
        
//         res.json({
//             success: true,
//             message: "Volunteer statistics retrieved successfully",
//             data: stats
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// module.exports = { getVolunteerHistory, addHistoryRecord, getVolunteerStats };