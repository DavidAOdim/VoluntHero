const request = require("supertest");
const express = require("express");
const authRoutes = require("../src/routes/auth");

// Create a lightweight Express app just for testing auth routes
const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth API", () => {
  it("should register a new user successfully", async () => {
    const registerRes = await request(app).post("/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Abc123!",
    });

    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.message).toBe("User registered successfully");
  });

  it("should log in an existing user successfully", async () => {
    // First, register the user (so login has data to check)
    await request(app).post("/auth/register").send({
      name: "Login Tester",
      email: "login@example.com",
      password: "Abc123!",
    });

    // Then, attempt login
    const loginRes = await request(app).post("/auth/login").send({
      email: "login@example.com",
      password: "Abc123!",
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.message).toBe("Login successful");
  });

  it("should return 400 for invalid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "invalid@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid email or password");
  });
});
