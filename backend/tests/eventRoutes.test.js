// tests/eventRoutes.test.js
const request = require('supertest');
const express = require('express');
const router = require('../src/routes/event');
const { _resetEvents } = require('../src/models/eventModel');

const app = express();
app.use(express.json());
app.use('/events', router);

describe('Event Routes', () => {
  beforeEach(() => {
    _resetEvents(); // clear events before each test
  });

  test("router should have '/' route with GET and POST", async () => {
    // test GET /
    const getRes = await request(app).get('/events');
    expect(getRes.statusCode).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);

    // test POST /
    const postRes = await request(app)
      .post('/events')
      .send({ title: 'Hackathon', date: '2025-10-13', location: 'Houston' });
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.title).toBe('Hackathon');
  });

  test("router should have '/:id' route with GET, PUT, DELETE", async () => {
    // first create an event
    const postRes = await request(app)
      .post('/events')
      .send({ title: 'Hackathon', date: '2025-10-13', location: 'Houston' });
    const id = postRes.body.id;

    // test GET /:id
    const getRes = await request(app).get(`/events/${id}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.id).toBe(id);

    // test PUT /:id
    const putRes = await request(app)
      .put(`/events/${id}`)
      .send({ title: 'Updated Title' });
    expect(putRes.statusCode).toBe(200);
    expect(putRes.body.title).toBe('Updated Title');

    // test DELETE /:id
    const delRes = await request(app).delete(`/events/${id}`);
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.message).toBe('event deleted successfully');
  });
});