const express = require('express');
const router = express.Router();

let profiles = {}; // In-memory profile storage (replace with a database in production) profile store: { email: { bio, avatarUrl } }

// Get user profile (endpoint: GET /profile/:email)
router.get('/:email', (req, res) => {
    const { email } = req.params;
    const profile = profiles[email];
    if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
});

// Create or update user profile (endpoint: PUT /profile/:email)
router.post('/', (req, res) => {
    const { email, fullName, address1, address2, city, state, zip, skills, preferences, availability } = req.body;
    if (!email || !fullName || !address1 || !city || !state || !zip || !skills?.length || !availability?.length) {
        return res.status(400).json({ message: 'Missing required profile fields' });
    }
    //saves profile data
    profiles[email] = {
      fullName,
      address1,
      address2,
      city,
      state,
      zip,
      skills,
      preferences,
      availability,
      updatedAt: new Date().toISOString(),
    };
    res.status(200).json({ message: 'Profile saved successfully' });
});

module.exports = router;