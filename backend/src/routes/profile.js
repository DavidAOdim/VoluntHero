// backend/src/routes/profile.js
const express = require("express");
const db = require("../../../db"); // ✅ Promise-based MySQL pool
const router = express.Router();

// GET user profile by email
router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const [results] = await db.query(
      "SELECT * FROM UserProfile WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// CREATE or UPDATE user profile
router.post("/", async (req, res) => {
  const {
    email,
    fullName,
    address1,
    address2,
    city,
    state,
    zip,
    skills,
    preferences,
    availability,
  } = req.body;

  if (
    !email ||
    !fullName ||
    !address1 ||
    !city ||
    !state ||
    !zip ||
    !skills?.length ||
    !availability?.length
  ) {
    return res
      .status(400)
      .json({ message: "Missing required profile fields" });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM UserProfile WHERE email = ?",
      [email]
    );

    if (results.length > 0) {
      // Update existing profile
      const updateSql = `
        UPDATE UserProfile
        SET fullName = ?, address1 = ?, address2 = ?, city = ?, state = ?, zip = ?, 
            skills = ?, preferences = ?, availability = ?, updatedAt = NOW()
        WHERE email = ?
      `;
      await db.query(updateSql, [
        fullName,
        address1,
        address2,
        city,
        state,
        zip,
        JSON.stringify(skills),
        JSON.stringify(preferences),
        JSON.stringify(availability),
        email,
      ]);

      res.status(200).json({ message: "Profile updated successfully" });
    } else {
      // Create new profile
      const insertSql = `
        INSERT INTO UserProfile 
        (email, fullName, address1, address2, city, state, zip, skills, preferences, availability, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      const [insertResult] = await db.query(insertSql, [
        email,
        fullName,
        address1,
        address2,
        city,
        state,
        zip,
        JSON.stringify(skills),
        JSON.stringify(preferences),
        JSON.stringify(availability),
      ]);

      res.status(201).json({
        message: "Profile created successfully",
        profileId: insertResult.insertId,
      });
    }
  } catch (err) {
    console.error("❌ Profile error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
