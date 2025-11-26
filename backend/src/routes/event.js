const express = require('express');
const router = express.Router();

const {
  getEvents,
  getSingleEvent,
  addEvent,
  editEvent,
  removeEvent,
} = require('../controllers/eventController');

// define event routes
router.get('/', getEvents);
router.get('/:id', getSingleEvent);
router.post('/', addEvent);
router.put('/:id', editEvent);
router.delete('/:id', removeEvent);

module.exports = router;