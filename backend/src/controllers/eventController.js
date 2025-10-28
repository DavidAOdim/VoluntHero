const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../models/eventModel');

const getEvents = async (req, res) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSingleEvent = async (req, res) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) return res.status(404).json({ message: 'event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addEvent = async (req, res) => {
  const { title, date, location, description, skills, urgency } = req.body;

  if (!title || !date || !location) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  if (title.length > 100) return res.status(400).json({ message: 'Title too long' });
  if (description && description.length > 500) return res.status(400).json({ message: 'Description too long' });

  try {
    const newEvent = await createEvent({ title, date, location, description, skills, urgency });
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const editEvent = async (req, res) => {
  try {
    const updatedEvent = await updateEvent(req.params.id, req.body);
    if (!updatedEvent) return res.status(404).json({ message: 'event not found' });
    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeEvent = async (req, res) => {
  try {
    const success = await deleteEvent(req.params.id);
    if (!success) return res.status(404).json({ message: 'event not found' });
    res.json({ message: 'event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEvents,
  getSingleEvent,
  addEvent,
  editEvent,
  removeEvent,
};
