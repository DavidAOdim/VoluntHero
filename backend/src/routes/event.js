// backend/src/routes/event.js
const express = require("express");
const router = express.Router();
const db = require("../utils/dbConnect"); // this should be your mysql2/promise pool

// ✅ Get all events
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM events");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ✅ Get a single event by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM events WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Event not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ✅ Add new event
router.post("/", async (req, res) => {
  const { name, date, location, requiredSkills } = req.body;
  try {
    await db.query(
      "INSERT INTO events (name, date, location, requiredSkills) VALUES (?, ?, ?, ?)",
      [name, date, location, JSON.stringify(requiredSkills || [])]
    );
    res.json({ success: true, message: "Event created successfully" });
  } catch (err) {
    console.error("Error adding event:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ✅ Edit an event
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, date, location, requiredSkills } = req.body;
  try {
    await db.query(
      "UPDATE events SET name=?, date=?, location=?, requiredSkills=? WHERE id=?",
      [name, date, location, JSON.stringify(requiredSkills || []), id]
    );
    res.json({ success: true, message: "Event updated successfully" });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// ✅ Delete an event
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM events WHERE id = ?", [id]);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

module.exports = router;
