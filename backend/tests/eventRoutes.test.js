// tests/eventRoutes.test.js
const request = require('supertest');
const express = require('express');

// Mock the controller functions
jest.mock('../src/controllers/eventController', () => ({
  getEvents: jest.fn((req, res) => res.json([{ id: 1, title: 'Mock Event' }])),
  getSingleEvent: jest.fn((req, res) => res.json({ id: req.params.id, title: 'Single Event' })),
  addEvent: jest.fn((req, res) => res.status(201).json({ id: 123, ...req.body })),
  editEvent: jest.fn((req, res) => res.json({ id: req.params.id, ...req.body })),
  removeEvent: jest.fn((req, res) => res.json({ message: 'event deleted successfully' })),
}));

const eventRoutes = require('../src/routes/event');
const { getEventById, getEvents } = require('../src/controllers/eventController');

const app = express();
app.use(express.json());
app.use('/events', eventRoutes);

describe('Event Routes', () => {
  test('GET /events should return all events', async () => {
    const res = await request(app).get('/events');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: 'Mock Event' }]);
  });

  test('GET /events/:id should return a single event', async () => {
    const res = await request(app).get('/events/42');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '42', title: 'Single Event' });
  });

  test('POST /events should create a new event', async () => {
    const newEvent = { title: 'New Event', date: '2025-10-27', location: 'Houston' };
    const res = await request(app).post('/events').send(newEvent);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 123, ...newEvent });
  });

  test('PUT /events/:id should update an event', async () => {
    const updated = { title: 'Updated Event' };
    const res = await request(app).put('/events/99').send(updated);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: '99', ...updated });
  });

  test('DELETE /events/:id should delete an event', async () => {
    const res = await request(app).delete('/events/77');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'event deleted successfully' });
  });
});
