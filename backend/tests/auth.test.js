// tests/auth.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); 
const authRouter = require('../src/routes/auth'); 

// Mock db.query
jest.mock('../db', () => ({
  query: jest.fn(),
}));

// Mock bcrypt
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
    expect(res.body.message).toBe('Email, password, and name are required');
  });

  test('POST /auth/register should return 400 if user already exists', async () => {
    db.query.mockImplementation((sql, params, cb) => {
      cb(null, [{ id: 1, email: params[0] }]); // simulate existing user
    });

    const res = await request(app).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('POST /auth/register should create a new user', async () => {
    db.query
      .mockImplementationOnce((sql, params, cb) => cb(null, [])) // no existing user
      .mockImplementationOnce((sql, params, cb) => cb(null, { insertId: 123 })); // insert success

    bcrypt.hash.mockResolvedValue('hashedPassword');

    const res = await request(app).post('/auth/register').send({
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
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
    db.query.mockImplementation((sql, params, cb) => cb(null, [])); // no user

    const res = await request(app).post('/auth/login').send({
      email: 'missing@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('POST /auth/login should return 400 if password is invalid', async () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, [{ id: 1, email: params[0], name: 'Test', password_hash: 'hashed' }])
    );
    bcrypt.compare.mockResolvedValue(false);

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid email or password');
  });

  test('POST /auth/login should succeed with valid credentials', async () => {
    db.query.mockImplementation((sql, params, cb) =>
      cb(null, [{ id: 1, email: params[0], name: 'Test', password_hash: 'hashed' }])
    );
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
    });
  });
});
