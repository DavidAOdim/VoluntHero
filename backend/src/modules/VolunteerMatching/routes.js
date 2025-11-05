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
//router.get("/event/:eventId/assigned", require("./controller").listAssigned);
// ✅ NEW: List already assigned volunteers for an event
router.get("/event/:eventId/assigned", async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await require("../../utils/dbConnect")
      .promise()
      .query(
        `SELECT volunteerId, volunteerName, participationStatus, hoursVolunteered, skillsUsed
         FROM volunteer_history
         WHERE eventId = ?
         ORDER BY createdAt DESC`,
        [eventId]
      );

    res.json({
      success: true,
      count: rows.length,
      data: rows.map(r => ({
        ...r,
        skillsUsed: (() => {
          try {
            return JSON.parse(r.skillsUsed || "[]");
          } catch {
            return [];
          }
        })(),
      })),
    });
  } catch (error) {
    console.error("Error fetching assigned volunteers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// ✅ Quick test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "VolunteerMatching routes.js loaded successfully!",
  });
});

module.exports = router;

