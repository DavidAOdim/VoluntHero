const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../config/db"); // ✅ MySQL connection
const router = express.Router();

// ✅ REGISTER a new user
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password, and name are required" });
  }

  try {
    // Check if the user already exists
    db.query(
      "SELECT * FROM UserCredentials WHERE email = ?",
      [email],
      async (err, results) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        if (results.length > 0) {
          return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query(
          "INSERT INTO UserCredentials (email, name, password_hash) VALUES (?, ?, ?)",
          [email, name, hashedPassword],
          (err, results) => {
            if (err) {
              console.error("❌ MySQL insert error:", err);
              return res
                .status(500)
                .json({ message: "Error saving user", error: err });
            }
            console.log("✅ MySQL insert success:", results);
            res.status(201).json({
              message: "User registered successfully",
              userId: results.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Unexpected error", error });
  }
});

// ✅ LOGIN an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query(
    "SELECT * FROM UserCredentials WHERE email = ?",
    [email],
    async (err, results) => {
      if (err)
        return res.status(500).json({ message: "Database error", error: err });
      if (results.length === 0)
        return res.status(400).json({ message: "Invalid email or password" });

      const user = results[0];
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      res.status(200).json({
        message: "Login successful",
        userId: user.id,
        name: user.name,
        email: user.email,
      });
    }
  );
});

module.exports = router;
