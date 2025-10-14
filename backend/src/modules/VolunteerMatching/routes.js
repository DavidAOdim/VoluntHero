const express = require('express');
const router = express.Router();
const matchingController = require('./controller');

router.get('/event/:eventId', matchingController.findMatches);
router.post('/', matchingController.createMatch);

module.exports = router;