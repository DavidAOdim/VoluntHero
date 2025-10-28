// tests/server.test.js
const request = require('supertest');
const app = require('../src/server'); 

describe('Server setup', () => {
  test('GET /test-matching should return success message', async () => {
    const res = await request(app).get('/test-matching');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: 'Matching module is working!',
      your_modules: 'Volunteer Matching & History by Vitor Santos',
    });
  });

  test('Unknown route should return 404', async () => {
    const res = await request(app).get('/nonexistent-route');
    expect(res.status).toBe(404);
  });

  test('POST /auth/register should be defined (may return validation error)', async () => {
    const res = await request(app).post('/auth/register').send({});
    // We don’t care about DB here, just that the route exists and responds
    expect([200, 400, 500]).toContain(res.status);
  });
});
