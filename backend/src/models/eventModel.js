let events = [];

function getAllEvents() {
  return events;
}

function getEventById(id) {
  return events.find((e) => e.id === id);
}

function createEvent(eventData) {
  const newEvent = { id: Date.now().toString(), ...eventData };
  events.push(newEvent);
  return newEvent;
}

function updateEvent(id, updatedData) {
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedData };
    return events[index];
  }
  return null;
}

function deleteEvent(id) {
  const index = events.findIndex((e) => e.id === id);
  if (index !== -1) {
    return events.splice(index, 1)[0];
  }
  return null;
}

// helper for tests to reset the in-memory array
function _resetEvents() {
  events = [];
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  _resetEvents,
};