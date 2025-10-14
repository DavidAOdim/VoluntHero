const request = require("supertest");
const express = require("express");
const profileRoutes = require("../src/routes/profile");

// Create a test Express app that mounts the profile routes
const app = express();
app.use(express.json());
app.use("/profile", profileRoutes);

describe("Profile API", () => {
  it("should create a new profile when all required fields are provided", async () => {
    const mockProfile = {
      email: "person@example.com",
      fullName: "Person Cooler",
      address1: "123 Main St",
      address2: "",
      city: "Houston",
      state: "TX",
      zip: "77005",
      skills: ["Tutoring", "Event Setup"],
      preferences: "Evening shifts only",
      availability: ["2025-10-15", "2025-10-16"],
    };

    const res = await request(app).post("/profile").send(mockProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile saved successfully");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/profile").send({
      email: "",
      fullName: "",
      address1: "",
      city: "",
      state: "",
      zip: "",
      skills: [],
      availability: [],
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Missing required profile fields");
  });

  it("should fetch a profile by email", async () => {
    // First, create a mock profile so it exists
    await request(app)
      .post("/profile")
      .send({
        email: "person@example.com",
        fullName: "Person Cooler",
        address1: "123 College Ave",
        address2: "",
        city: "Houston",
        state: "TX",
        zip: "77004",
        skills: ["Tutoring"],
        preferences: "Morning shifts",
        availability: ["2025-10-16"],
      });

    // Then, fetch it by email
    const res = await request(app).get("/profile/person@example.com");
    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe("Person Cooler");
  });

  it("should return 404 if profile not found", async () => {
    const res = await request(app).get("/profile/unknown@example.com");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Profile not found");
  });
});
