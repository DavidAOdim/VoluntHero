// eventModel.test.js
const db = require('../db');
const eventModel = require('../src/models/eventModel');

// Mock the db.query function
jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('eventModel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllEvents should return all events', async () => {
    const mockRows = [{ id: 1, title: 'Test Event' }];
    db.query.mockResolvedValue([mockRows]);

    const result = await eventModel.getAllEvents();

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM events');
    expect(result).toEqual(mockRows);
  });

  test('getEventById should return a single event', async () => {
    const mockRows = [{ id: 1, title: 'Test Event' }];
    db.query.mockResolvedValue([mockRows]);

    const result = await eventModel.getEventById(1);

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM events WHERE id = ?', [1]);
    expect(result).toEqual(mockRows[0]);
  });

  test('createEvent should insert and return new event', async () => {
    const eventData = {
      title: 'New Event',
      date: '2025-10-27',
      location: 'Houston',
      description: 'Test description',
      skills: 'Node.js',
      urgency: 'High',
    };
    db.query.mockResolvedValue([{ insertId: 123 }]);

    const result = await eventModel.createEvent(eventData);

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO events (title, date, location, description, skills, urgency) VALUES (?, ?, ?, ?, ?, ?)',
      [
        eventData.title,
        eventData.date,
        eventData.location,
        eventData.description,
        eventData.skills,
        eventData.urgency,
      ]
    );
    expect(result).toEqual({ id: 123, ...eventData });
  });

  test('updateEvent should update and return updated event', async () => {
    const updatedData = { title: 'Updated Event' };
    db.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await eventModel.updateEvent(1, updatedData);

    expect(db.query).toHaveBeenCalledWith('UPDATE events SET ? WHERE id = ?', [updatedData, 1]);
    expect(result).toEqual({ id: 1, ...updatedData });
  });

  test('updateEvent should return null if no rows updated', async () => {
    db.query.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await eventModel.updateEvent(1, { title: 'Nothing' });

    expect(result).toBeNull();
  });

  test('deleteEvent should return true if deleted', async () => {
    db.query.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await eventModel.deleteEvent(1);

    expect(db.query).toHaveBeenCalledWith('DELETE FROM events WHERE id = ?', [1]);
    expect(result).toBe(true);
  });

  test('deleteEvent should return false if nothing deleted', async () => {
    db.query.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await eventModel.deleteEvent(1);

    expect(result).toBe(false);
  });
});
