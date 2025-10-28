// tests/eventController.test.js
const request = require('supertest');
const express = require('express');
const controller = require('../src/controllers/eventController');
const model = require('../src/models/eventModel');

// Mock the model functions
jest.mock('../src/models/eventModel');

const app = express();
app.use(express.json());

// Wire up routes for testing
app.get('/events', controller.getEvents);
app.get('/events/:id', controller.getSingleEvent);
app.post('/events', controller.addEvent);
app.put('/events/:id', controller.editEvent);
app.delete('/events/:id', controller.removeEvent);

describe('Event Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // GET /events
  test('GET /events returns all events', async () => {
    model.getAllEvents.mockResolvedValue([{ id: 1, title: 'Test Event' }]);

    const res = await request(app).get('/events');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: 'Test Event' }]);
  });

  // GET /events/:id
  test('GET /events/:id returns a single event', async () => {
    model.getEventById.mockResolvedValue({ id: 1, title: 'Test Event' });

    const res = await request(app).get('/events/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: 'Test Event' });
  });

  test('GET /events/:id returns 404 if not found', async () => {
    model.getEventById.mockResolvedValue(null);

    const res = await request(app).get('/events/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('event not found');
  });

  // POST /events
  test('POST /events creates a new event', async () => {
    const newEvent = {
      title: 'New Event',
      date: '2025-10-27',
      location: 'Houston',
      description: 'Test description',
      skills: 'Node.js',
      urgency: 'High',
    };
    model.createEvent.mockResolvedValue({ id: 123, ...newEvent });

    const res = await request(app).post('/events').send(newEvent);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 123, ...newEvent });
  });

  test('POST /events validates required fields', async () => {
    const res = await request(app).post('/events').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('missing required fields');
  });

  test('POST /events validates title length', async () => {
    const res = await request(app).post('/events').send({
      title: 'x'.repeat(101),
      date: '2025-10-27',
      location: 'Houston',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Title too long');
  });

  test('POST /events validates description length', async () => {
    const res = await request(app).post('/events').send({
      title: 'Valid Title',
      date: '2025-10-27',
      location: 'Houston',
      description: 'x'.repeat(501),
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Description too long');
  });

  // PUT /events/:id
  test('PUT /events/:id updates an event', async () => {
    model.updateEvent.mockResolvedValue({ id: 1, title: 'Updated Event' });

    const res = await request(app).put('/events/1').send({ title: 'Updated Event' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: 'Updated Event' });
  });

  test('PUT /events/:id returns 404 if not found', async () => {
    model.updateEvent.mockResolvedValue(null);

    const res = await request(app).put('/events/999').send({ title: 'Nothing' });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('event not found');
  });

  // DELETE /events/:id
  test('DELETE /events/:id deletes an event', async () => {
    model.deleteEvent.mockResolvedValue(true);

    const res = await request(app).delete('/events/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('event deleted successfully');
  });

  test('DELETE /events/:id returns 404 if not found', async () => {
    model.deleteEvent.mockResolvedValue(false);

    const res = await request(app).delete('/events/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('event not found');
  });
});
