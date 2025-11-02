const express = require("express");
const router = express.Router();
const db = require("../utils/dbConnect");

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      "SELECT id, name, email FROM volunteers ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching volunteers:", err);
    res.status(500).json({ message: "Failed to load volunteers." });
  }
});

module.exports = router;
