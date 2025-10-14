const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../models/eventModel');

const getEvents = (req, res) => {
  res.json(getAllEvents());
};

const getSingleEvent = (req, res) => {
  const event = getEventById(req.params.id);
  if (!event) return res.status(404).json({ message: 'event not found' });
  res.json(event);
};

const addEvent = (req, res) => {
  const { title, date, location, description, skills, urgency } = req.body;

  // required fields
  if (!title || !date || !location) {
    return res.status(400).json({ message: 'missing required fields' });
  }

  // length validations
  if (title.length > 100) return res.status(400).json({ message: 'Title too long' });
  if (description && description.length > 500) return res.status(400).json({ message: 'Description too long' });

  const newEvent = createEvent({
    title,
    date,
    location,
    description,
    skills,
    urgency,
  });

  res.status(201).json(newEvent);
};

const editEvent = (req, res) => {
  const updatedEvent = updateEvent(req.params.id, req.body);
  if (!updatedEvent)
    return res.status(404).json({ message: 'event not found' });
  res.json(updatedEvent);
};

const removeEvent = (req, res) => {
  const deletedEvent = deleteEvent(req.params.id);
  if (!deletedEvent)
    return res.status(404).json({ message: 'event not found' });
  res.json({ message: 'event deleted successfully' });
};

module.exports = {
  getEvents,
  getSingleEvent,
  addEvent,
  editEvent,
  removeEvent,
};