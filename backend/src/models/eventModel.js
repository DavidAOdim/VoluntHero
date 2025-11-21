const db = require('../../../db');

// Get all events
async function getAllEvents() {
  const [rows] = await db.query('SELECT * FROM events');
  return rows;
}

// Get event by ID
async function getEventById(id) {
  const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
  return rows[0];
}

// Create event
async function createEvent(eventData) {
  const { title, date, location, description, skills, urgency } = eventData;
  const [result] = await db.query(
    'INSERT INTO events (title, date, location, description, skills, urgency) VALUES (?, ?, ?, ?, ?, ?)',
    [title, date, location, description, skills, urgency]
  );
  return { id: result.insertId, ...eventData };
}

// Update event
async function updateEvent(id, updatedData) {
  const fields = Object.keys(updatedData).map(key => `${key} = ?`).join(", ");
  const values = Object.values(updatedData);
  const [result] = await db.query(
  `UPDATE events SET ${fields} WHERE id = ?`,
  [...values, id]
);
  if (result.affectedRows === 0) return null;
  return { id, ...updatedData };
}

// Delete event
async function deleteEvent(id) {
  const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
