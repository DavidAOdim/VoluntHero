const request = require("supertest");
const express = require("express");
const profileRoutes = require("../src/routes/profile");
const db = require("../../db");

// Mock MySQL db query
jest.mock("../../db", () => ({
  query: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/profile", profileRoutes);

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {}); // silence console.error
});

afterAll(() => {
  console.error.mockRestore(); // restore normal behavior
});

describe("Profile API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CREATE NEW PROFILE
  test("POST /profile should create a new profile", async () => {
    const mockBody = {
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

    // First query → profile does NOT exist
    db.query
      .mockResolvedValueOnce([[]]) // SELECT returns empty
      .mockResolvedValueOnce([{ insertId: 10 }]); // INSERT returns insert result

    const res = await request(app).post("/profile").send(mockBody);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: "Profile created successfully",
      profileId: 10,
    });
  });

  // UPDATE EXISTING PROFILE
  test("POST /profile should update an existing profile", async () => {
    const mockBody = {
      email: "person@example.com",
      fullName: "Updated Name",
      address1: "456 Lane",
      address2: "",
      city: "Houston",
      state: "TX",
      zip: "77005",
      skills: ["Tutoring"],
      preferences: "Morning shifts",
      availability: ["2025-10-20"],
    };

    db.query
      .mockResolvedValueOnce([[{ email: "person@example.com" }]]) // SELECT returns existing
      .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE returns success

    const res = await request(app).post("/profile").send(mockBody);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
  });

  // MISSING FIELDS
  test("POST /profile returns 400 when required fields missing", async () => {
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

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Missing required profile fields");
  });

  // FETCH EXISTING PROFILE
  test("GET /profile/:email returns profile when found", async () => {
    db.query.mockResolvedValueOnce([
      [
        {
          email: "person@example.com",
          fullName: "Person Cooler",
          address1: "123 College Ave",
          city: "Houston",
          state: "TX",
          zip: "77004",
        },
      ],
    ]);

    const res = await request(app).get("/profile/person@example.com");

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe("Person Cooler");
  });

  // PROFILE NOT FOUND
  test("GET /profile/:email returns 404 when profile doesn't exist", async () => {
    db.query.mockResolvedValueOnce([[]]); // no results

    const res = await request(app).get("/profile/unknown@example.com");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Profile not found");
  });

  // GET /profile/:email -> simulate database error
test("GET /profile/:email returns 500 on database error", async () => {
  db.query.mockRejectedValueOnce(new Error("DB failure"));

  const res = await request(app).get("/profile/person@example.com");

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Database error");
  expect(typeof res.body.error).toBe("object"); // just check error is an object
  expect(res.body.error).toBeDefined(); // ensure it exists
});

// POST /profile -> simulate database error
test("POST /profile returns 500 on database error", async () => {
  db.query.mockRejectedValueOnce(new Error("DB failure"));

  const res = await request(app).post("/profile").send({
    email: "person@example.com",
    fullName: "Name",
    address1: "123 Main",
    city: "City",
    state: "ST",
    zip: "00000",
    skills: ["Skill"],
    availability: ["2025-10-20"],
  });

  expect(res.status).toBe(500);
  expect(res.body.message).toBe("Database error");
  expect(typeof res.body.error).toBe("object"); // just check error is an object
  expect(res.body.error).toBeDefined(); // ensure it exists
  });
});