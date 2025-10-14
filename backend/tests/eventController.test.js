// tests/eventController.test.js
const request = require('supertest');
const express = require('express');
const router = require('../src/routes/event');
const { _resetEvents } = require('../src/models/eventModel');

const app = express();
app.use(express.json());
app.use('/events', router);

describe('Event Controller', () => {
  beforeEach(() => {
    _resetEvents(); // reset events before each test
  });

  // helper to create an event
  async function createTestEvent() {
    const res = await request(app)
      .post('/events')
      .send({ title: 'Hackathon', date: '2025-10-13', location: 'Houston' });
    return res.body;
  }

  test('POST /events should create a new event', async () => {
    const event = await createTestEvent();
    expect(event.title).toBe('Hackathon');
    expect(event.id).toBeDefined();
  });

  test('POST /events missing required fields should return 400', async () => {
    const res = await request(app).post('/events').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('missing required fields');
  });

  test('POST /events title too long should return 400', async () => {
    const longTitle = 'A'.repeat(101);
    const res = await request(app)
      .post('/events')
      .send({ title: longTitle, date: '2025-10-13', location: 'Houston' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Title too long');
  });

  test('POST /events description too long should return 400', async () => {
    const longDesc = 'D'.repeat(501);
    const res = await request(app)
      .post('/events')
      .send({ title: 'Event', date: '2025-10-13', location: 'Houston', description: longDesc });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Description too long');
  });

  test('GET /events should return all events', async () => {
    await createTestEvent();
    const res = await request(app).get('/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test('GET /events/:id should return a single event', async () => {
    const event = await createTestEvent();
    const res = await request(app).get(`/events/${event.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(event.id);
  });

  test('PUT /events/:id should update event', async () => {
    const event = await createTestEvent();
    const res = await request(app)
      .put(`/events/${event.id}`)
      .send({ title: 'Updated Title' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  test('PUT /events/:id non-existent should return 404', async () => {
    const res = await request(app)
      .put('/events/nonexistent-id')
      .send({ title: 'Updated Title' });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('event not found');
  });

  test('DELETE /events/:id should delete event', async () => {
    const event = await createTestEvent();
    const res = await request(app).delete(`/events/${event.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('event deleted successfully');
  });

  test('DELETE /events/:id non-existent should return 404', async () => {
    const res = await request(app).delete('/events/nonexistent-id');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('event not found');
  });
});