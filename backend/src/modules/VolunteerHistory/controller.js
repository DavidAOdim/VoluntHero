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

