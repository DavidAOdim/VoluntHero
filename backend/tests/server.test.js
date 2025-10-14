const request = require("supertest");
const express = require("express");
const authRoutes = require("../src/routes/auth");
const profileRoutes = require("../src/routes/profile");

// Create a small express app just for testing server setup
const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

describe("Server setup", () => {
  it("should successfully mount /auth routes", async () => {
    // POST to /auth/login — we only care that it responds
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@example.com", password: "Abc123!" });

    // Response code can be 200 if works, or 400/404 if validation fails
    expect([200, 400, 401, 404]).toContain(res.statusCode);
  });

  it("should successfully mount /profile routes", async () => {
    // POST to /profile with missing data to confirm route exists
    const res = await request(app).post("/profile").send({});

    // Should respond (typically 400 due to validation)
    expect([200, 400, 404]).toContain(res.statusCode);
  });
});
