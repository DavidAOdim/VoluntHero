const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

let users = {}; // In-memory user storage (replace with a database in production) user store: { email: { passwordHash, name } }

// Register a new user (endpoint: POST /auth/register
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ message: 'Email, password, and name are required' });
    }
    if (users[email]) {
        return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[email] = { name, passwordHash: hashedPassword };
    res.status(201).json({ message: 'User registered successfully' });
});

//login an existing user (endpoint: POST /auth/login)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users[email];

    if (!user) return res.status(400).json({ message: 'Invalid email or password' }); //authentication

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash); //authentication check
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

    res.json({ message: 'Login successful', name: user.name, email });
});

module.exports = router;