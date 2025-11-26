// backend/src/routes/volunteers.js
const express = require("express");
const db = require("../../../db");
const router = express.Router();

// GET /volunteers/by-email/:email
router.get("/by-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM volunteers WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Volunteer not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("Volunteer lookup error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

module.exports = router;
