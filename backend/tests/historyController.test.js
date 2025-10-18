const request = require('supertest');
const express = require('express');
const historyRoutes = require('../src/modules/VolunteerHistory/routes');

const app = express();
app.use(express.json());
app.use('/history', historyRoutes);

describe('History Controller', () => {
  test('GET /history/:volunteerId - should return history', async () => {
    const response = await request(app)
      .get('/history/1')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /history/stats/:volunteerId - should return statistics', async () => {
    const response = await request(app)
      .get('/history/stats/1')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('totalEvents');
    expect(response.body.data).toHaveProperty('totalHours');
  });

  test('POST /history - should add history record', async () => {
    const historyData = {
      volunteerId: 2,
      eventId: 3,
      participationStatus: 'completed',
      hours: 4
    };

    const response = await request(app)
      .post('/history')
      .send(historyData)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('participationStatus', 'completed');
  });
});