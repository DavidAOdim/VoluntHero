// backend/src/routes/profile.js
const express = require("express");
const db = require("../../../db"); // ✅ Shared MySQL pool connection
const router = express.Router();

/**
 * ✅ GET user profile by email
 * Endpoint: GET /profile/:email
 */
router.get("/:email", (req, res) => {
  const { email } = req.params;

  const sql = "SELECT * FROM UserProfile WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(results[0]);
  });
});

/**
 * ✅ CREATE or UPDATE user profile
 * Endpoint: POST /profile
 */
router.post("/", (req, res) => {
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

  // Validate required fields
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

  // ✅ Check if the profile already exists
  const checkSql = "SELECT * FROM UserProfile WHERE email = ?";
  db.query(checkSql, [email], (err, results) => {
    if (err) {
      console.error("❌ MySQL select error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length > 0) {
      // ✅ Update existing profile
      const updateSql = `
        UPDATE UserProfile
        SET fullName = ?, address1 = ?, address2 = ?, city = ?, state = ?, zip = ?, 
            skills = ?, preferences = ?, availability = ?, updatedAt = NOW()
        WHERE email = ?
      `;
      db.query(
        updateSql,
        [
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
        ],
        (err) => {
          if (err) {
            console.error("❌ MySQL update error:", err);
            return res
              .status(500)
              .json({ message: "Error updating profile", error: err });
          }
          res
            .status(200)
            .json({ message: "Profile updated successfully" });
        }
      );
    } else {
      // ✅ Create new profile
      const insertSql = `
        INSERT INTO UserProfile 
        (email, fullName, address1, address2, city, state, zip, skills, preferences, availability, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      db.query(
        insertSql,
        [
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
        ],
        (err, result) => {
          if (err) {
            console.error("❌ MySQL insert error:", err);
            return res
              .status(500)
              .json({ message: "Error creating profile", error: err });
          }
          res.status(201).json({
            message: "Profile created successfully",
            profileId: result.insertId,
          });
        }
      );
    }
  });
});

module.exports = router;
