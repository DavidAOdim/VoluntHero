const request = require("supertest");
const express = require("express");
const db = require("../src/config/db"); // ✅ Import the DB connection
const authRoutes = require("../src/routes/auth");

// Create a test app
const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

beforeAll((done) => {
  // Clear the UserCredentials table before tests start
  db.query("DELETE FROM UserCredentials", (err) => {
    if (err) console.error("❌ Error clearing test table:", err);
    done();
  });
});

afterAll((done) => {
  // Close the DB connection after tests finish
  db.end(() => {
    done();
  });
});

describe("Auth API (MySQL-backed)", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Abc123!",
    });

    expect([200, 201]).toContain(res.statusCode);
    expect(res.body.message).toMatch(/registered/i);
  });

  it("should prevent duplicate registration for the same email", async () => {
    // First registration
    await request(app).post("/auth/register").send({
      name: "Duplicate User",
      email: "dup@example.com",
      password: "Abc123!",
    });

    // Attempt duplicate registration
    const res = await request(app).post("/auth/register").send({
      name: "Duplicate Again",
      email: "dup@example.com",
      password: "Abc123!",
    });

    expect([400, 409]).toContain(res.statusCode);
    expect(res.body.message).toMatch(/already exists|duplicate/i);
  });

  it("should return 400 if registration fields are missing", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "",
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(
      /missing|required|email, password, and name are required/i
    );
  });

  it("should log in an existing user successfully", async () => {
    // Register first
    await request(app).post("/auth/register").send({
      name: "Login Tester",
      email: "login@example.com",
      password: "Abc123!",
    });

    // Then log in
    const res = await request(app).post("/auth/login").send({
      email: "login@example.com",
      password: "Abc123!",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/login successful/i);
  });

  it("should return 400 for invalid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "wrong@example.com",
      password: "WrongPass123",
    });

    expect([400, 401]).toContain(res.statusCode);
    expect(res.body.message).toMatch(/invalid/i);
  });

  it("should return 400 if login fields are missing", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(
      /missing|required|email and password are required/i
    );
  });
});
