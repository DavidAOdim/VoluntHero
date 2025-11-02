// backend/src/modules/VolunteerHistory/controller.js
const service = require("./service");
const db = require("../../utils/dbConnect");

// GET /history/:volunteerId
exports.getHistory = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const data = await service.getVolunteerHistory(volunteerId);
    res.json({ success: true, volunteerId: Number(volunteerId), count: data.length, data });
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /history
exports.addHistory = async (req, res) => {
  try {
    const { volunteerId, eventId, participationStatus, hoursVolunteered, feedback } = req.body;
    if (!volunteerId || !eventId) {
      return res
        .status(400)
        .json({ success: false, message: "volunteerId and eventId are required" });
    }

    const rec = await service.addHistoryRecord(
      volunteerId,
      eventId,
      participationStatus,
      hoursVolunteered,
      feedback
    );

    res.status(201).json({ success: true, data: rec });
  } catch (err) {
    console.error("addHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /history/stats/:volunteerId
exports.getStats = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const stats = await service.getVolunteerStats(volunteerId);
    res.json({ success: true, volunteerId: Number(volunteerId), data: stats });
  } catch (err) {
    console.error("getStats error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /history/:id/complete  (optional admin action)
exports.markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query(
      "UPDATE volunteer_history SET participationStatus = 'completed' WHERE id = ?",
      [id]
    );
    res.json({ success: true, message: "Marked as completed" });
  } catch (err) {
    console.error("markComplete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /history/ping
exports.ping = (_req, res) => {
  res.json({ success: true, message: "VolunteerHistory routes connected successfully!" });
};

exports.updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { participationStatus, hoursVolunteered, feedback, skillsUsed } = req.body;

    const [result] = await db.promise().query(
      `UPDATE volunteer_history
       SET participationStatus = ?, hoursVolunteered = ?, feedback = ?, skillsUsed = ?
       WHERE id = ?`,
      [
        participationStatus,
        hoursVolunteered || 0,
        feedback || "",
        JSON.stringify(skillsUsed || []),
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Record not found" });
    }

    res.json({ success: true, message: "History updated successfully." });
  } catch (err) {
    console.error("updateHistory error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// // backend/src/modules/VolunteerHistory/controller.js
// const service = require('./service');
// const db = require("../../utils/dbConnect");

// exports.getHistory = async (req, res) => {
//   try {
//     const { volunteerId } = req.params;
//     const data = await service.getVolunteerHistory(volunteerId);
//     res.json({ success: true, data });
//   } catch (err) {
//     console.error('getHistory error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.addHistory = async (req, res) => {
//   try {
//     const { volunteerId, eventId, participationStatus, hoursVolunteered, feedback } = req.body;
//     if (!volunteerId || !eventId) {
//       return res.status(400).json({ success: false, message: 'volunteerId and eventId are required' });
//     }
//     const rec = await service.addHistoryRecord(
//       volunteerId,
//       eventId,
//       participationStatus,
//       hoursVolunteered,
//       feedback
//     );
//     res.status(201).json({ success: true, data: rec });
//   } catch (err) {
//     console.error('addHistory error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.getStats = async (req, res) => {
//   try {
//     const { volunteerId } = req.params;
//     const stats = await service.getVolunteerStats(volunteerId);
//     if (!rows.length) {
//         return [];
//     }
//     res.json({ success: true, data: stats });
//   } catch (err) {
//     console.error('getStats error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// exports.ping = (_req, res) => {
//   res.json({ success: true, message: 'VolunteerHistory routes connected successfully!' });
// };


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