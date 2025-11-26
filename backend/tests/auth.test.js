/*const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');
const authRouter = require('../src/routes/auth');

// Mock the db module to use promises
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // REGISTER
  test('POST /auth/register should validate required fields', async () => {
    const res = await request(app).post('/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  test('POST /auth/register should return 400 if user already exists', async () => {
    db.query.mockResolvedValue([[{ id: 1, email: 'test@example.com' }]]);

    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('POST /auth/register should create a new user', async () => {
    db.query
      .mockResolvedValueOnce([[]]) // no existing user
      .mockResolvedValueOnce([{ insertId: 123 }]);

    bcrypt.hash.mockResolvedValue('hashedPassword');

    const res = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User'
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'User registered successfully',
      userId: 123,
    });
  });

  // LOGIN
  test('POST /auth/login should validate required fields', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  test('POST /auth/login should return 400 if user not found', async () => {
    db.query.mockResolvedValue([[]]);

    const res = await request(app).post('/auth/login').send({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('POST /auth/login should return 400 if password is invalid', async () => {
    db.query.mockResolvedValue([
      [{ id: 1, email: 'test@example.com', name: 'Test', password_hash: 'hashed' }]
    ]);

    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid password');
  });

  test('POST /auth/login should succeed with valid credentials', async () => {
    db.query.mockResolvedValue([
      [{ id: 1, email: 'test@example.com', name: 'Test', password_hash: 'hashed' }]
    ]);

    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Login successful',
      userId: 1,
      name: 'Test',
      email: 'test@example.com',
      role: undefined, // your code doesn't return role
    });
  });
});
*/

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');
const authRouter = require('../src/routes/auth');

// Mock db and bcrypt
jest.mock('../../db', () => ({
  query: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe('Auth Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // REGISTER
  test('POST /auth/register should validate required fields', async () => {
    const res = await request(app).post('/auth/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  test('POST /auth/register should return 400 if user already exists', async () => {
    db.query.mockResolvedValue([[{ id: 1, email: 'test@example.com' }]]);

    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('POST /auth/register should create a new user', async () => {
    db.query
      .mockResolvedValueOnce([[]]) // no existing user
      .mockResolvedValueOnce([{ insertId: 123 }]);

    bcrypt.hash.mockResolvedValue('hashedPassword');

    const res = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User'
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'User registered successfully',
      userId: 123,
    });
  });

  test('POST /auth/register should handle unexpected error', async () => {
    db.query.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).post('/auth/register').send({
      email: 'error@example.com',
      password: 'password123',
      name: 'Error User',
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Unexpected error');
  });

  // LOGIN
  test('POST /auth/login should validate required fields', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  test('POST /auth/login should return 400 if user not found', async () => {
    db.query.mockResolvedValue([[]]);

    const res = await request(app).post('/auth/login').send({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('POST /auth/login should return 400 if password is invalid', async () => {
    db.query.mockResolvedValue([
      [{ id: 1, email: 'test@example.com', name: 'Test', password_hash: 'hashed' }]
    ]);

    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid password');
  });

  test('POST /auth/login should succeed with valid credentials', async () => {
    db.query.mockResolvedValue([
      [{ id: 1, email: 'test@example.com', name: 'Test', password_hash: 'hashed' }]
    ]);

    bcrypt.compare.mockResolvedValue(true);

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Login successful',
      userId: 1,
      name: 'Test',
      email: 'test@example.com',
      role: undefined, // your code doesn't return role
    });
  });

  test('POST /auth/login should handle unexpected error', async () => {
    db.query.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).post('/auth/login').send({
      email: 'error@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Unexpected error');
  });

  // FORGOT PASSWORD
  test('POST /auth/forgot-password should validate required fields', async () => {
    const res = await request(app).post('/auth/forgot-password').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and new password are required');
  });

  test('POST /auth/forgot-password should return 400 if email not found', async () => {
    db.query.mockResolvedValue([[]]);

    const res = await request(app).post('/auth/forgot-password').send({
      email: 'missing@example.com',
      newPassword: 'newpass123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email not found');
  });

  test('POST /auth/forgot-password should reset password successfully', async () => {
    db.query
      .mockResolvedValueOnce([[{ id: 1, email: 'test@example.com' }]]) // user exists
      .mockResolvedValueOnce([{}]); // update query

    bcrypt.hash.mockResolvedValue('newHashedPassword');

    const res = await request(app).post('/auth/forgot-password').send({
      email: 'test@example.com',
      newPassword: 'newpass123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Password reset successful');
  });

  test('POST /auth/forgot-password should handle unexpected error', async () => {
    db.query.mockRejectedValue(new Error('DB failure'));

    const res = await request(app).post('/auth/forgot-password').send({
      email: 'error@example.com',
      newPassword: 'newpass123',
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Unexpected error');
  });
});
