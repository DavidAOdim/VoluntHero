const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

let users = {}; // In-memory user store: { email: { name, passwordHash } }

// Register a new user
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  // Check for missing fields
  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ message: "Missing required fields: email, password, and name" });
  }

  // Check for duplicate user
  if (users[email]) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password and store user
  const hashedPassword = await bcrypt.hash(password, 10);
  users[email] = { name, passwordHash: hashedPassword };

  return res.status(201).json({ message: "User registered successfully" });
});

// Login an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check for missing login data
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required login fields" });
  }

  const user = users[email];
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  return res.status(200).json({
    message: "Login successful",
    name: user.name,
    email,
  });
});

module.exports = router;
