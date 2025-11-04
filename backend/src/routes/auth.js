const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../../../db"); // ✅ MySQL promise pool
const router = express.Router();

// ✅ REGISTER a new user
router.post("/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Email, password, and name are required" });
  }

  try {
    // Check if the user already exists
    const [existing] = await db.query(
      "SELECT * FROM UserCredentials WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with role (default volunteer)
    const [result] = await db.query(
      "INSERT INTO UserCredentials (email, name, password_hash, role) VALUES (?, ?, ?, ?)",
      [email, name, hashedPassword, role || "volunteer"]
    );

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
      role: role || "volunteer",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Unexpected error", error });
  }
});

// ✅ LOGIN an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM UserCredentials WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
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
    console.error("Login error:", error);
    res.status(500).json({ message: "Unexpected error", error });
  }
});

module.exports = router;
