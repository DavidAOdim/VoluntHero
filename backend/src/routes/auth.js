// backend/src/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../../../db"); // ✅ Promise-based MySQL pool
const router = express.Router();

// REGISTER a new user
router.post("/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password, and name are required" });
  }

  try {
    // Check if user already exists
    const [results] = await db.query(
      "SELECT * FROM UserCredentials WHERE email = ?",
      [email]
    );
    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [insertResult] = await db.query(
      "INSERT INTO UserCredentials (email, name, password_hash, role) VALUES (?, ?, ?, ?)",
      [email, name, hashedPassword, role || "user"] // or "admin" for admin accounts
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: insertResult.insertId,
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    res.status(500).json({ message: "Unexpected error", error });
  }
});

// LOGIN an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [results] = await db.query(
      "SELECT * FROM UserCredentials WHERE email = ?",
      [email]
    );
    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

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
      role: user.role,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Unexpected error", error });
  }
});

module.exports = router;
