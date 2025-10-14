// tests/eventModel.test.js
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  _resetEvents,
} = require('../src/models/eventModel.js');

describe('Event Model', () => {
  beforeEach(() => {
    _resetEvents(); // reset the events array
  });

  test('should create an event', () => {
    const e = createEvent({ title: 'Test', date: '2025-10-13', location: 'TX' });
    expect(getAllEvents().length).toBe(1);
    expect(e).toHaveProperty('id');
    expect(e.title).toBe('Test');
  });

  test('should get event by id', () => {
    const e = createEvent({ title: 'FindMe', date: '2025', location: 'NY' });
    const found = getEventById(e.id);
    expect(found).toEqual(e);
  });

  test('should update an event', () => {
    const e = createEvent({ title: 'Old', date: '2025', location: 'LA' });
    const updated = updateEvent(e.id, { title: 'New' });
    expect(updated.title).toBe('New');
  });

  test('should delete an event', () => {
    const e = createEvent({ title: 'Delete', date: '2025', location: 'TX' });
    const deleted = deleteEvent(e.id);
    expect(deleted).toBeTruthy();
    expect(getAllEvents().length).toBe(0);
  });
});