const request = require('supertest');
const express = require('express');
const matchingRoutes = require('../src/modules/VolunteerMatching/routes');

const app = express();
app.use(express.json());
app.use('/matching', matchingRoutes);

describe('Matching Controller', () => {
  test('GET /matching/event/:eventId - should return matches', async () => {
    const response = await request(app)
      .get('/matching/event/1')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('retrieved successfully');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /matching/event/invalid - should return 500 error', async () => {
    const response = await request(app)
      .get('/matching/event/invalid')
      .expect(500);
    
    expect(response.body.success).toBe(false);
  });

  test('POST /matching - should create match', async () => {
    const matchData = {
      volunteerId: 1,
      eventId: 2
    };

    const response = await request(app)
      .post('/matching')
      .send(matchData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('successfully matched');
    expect(response.body.data).toHaveProperty('volunteerName');
  });
});