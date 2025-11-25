const request = require("supertest");
const express = require("express");
const controller = require("../src/controllers/eventController");
const model = require("../src/models/eventModel");

// Mock DB model functions
jest.mock("../src/models/eventModel");

const app = express();
app.use(express.json());

// Routes
app.get("/events", controller.getEvents);
app.get("/events/:id", controller.getSingleEvent);
app.post("/events", controller.addEvent);
app.put("/events/:id", controller.editEvent);
app.delete("/events/:id", controller.removeEvent);

describe("Event Controller", () => {
  afterEach(() => jest.clearAllMocks());

  // ----------------------------------------------------------
  // GET /events
  // ----------------------------------------------------------
  test("GET /events returns all events", async () => {
    model.getAllEvents.mockResolvedValue([{ id: 1, title: "Test Event" }]);

    const res = await request(app).get("/events");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1, title: "Test Event" }]);
  });

  test("GET /events handles DB errors (500)", async () => {
    model.getAllEvents.mockRejectedValue(new Error("DB fail"));

    const res = await request(app).get("/events");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("DB fail");
  });

  // ----------------------------------------------------------
  // GET /events/:id
  // ----------------------------------------------------------
  test("GET /events/:id returns a single event", async () => {
    model.getEventById.mockResolvedValue({ id: 1, title: "Test Event" });

    const res = await request(app).get("/events/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "Test Event" });
  });

  test("GET /events/:id returns 404 if not found", async () => {
    model.getEventById.mockResolvedValue(null);

    const res = await request(app).get("/events/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("event not found");
  });

  test("GET /events/:id handles DB errors (500)", async () => {
    model.getEventById.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/events/1");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("DB error");
  });

  // ----------------------------------------------------------
  // POST /events
  // ----------------------------------------------------------
  test("POST /events creates a new event", async () => {
    const newEvent = {
      title: "New Event",
      date: "2025-10-27",
      location: "Houston",
      description: "Test description",
      requiredSkills: "Node.js",
    };

    model.createEvent.mockResolvedValue({ id: 123, ...newEvent });

    const res = await request(app).post("/events").send(newEvent);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 123, ...newEvent });
  });

  test("POST /events validates required fields", async () => {
    const res = await request(app).post("/events").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("missing required fields");
  });

  test("POST /events validates title length", async () => {
    const res = await request(app).post("/events").send({
      title: "x".repeat(101),
      date: "2025-10-27",
      location: "Houston",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Title too long");
  });

  test("POST /events validates description length", async () => {
    const res = await request(app).post("/events").send({
      title: "Valid",
      date: "2025-10-27",
      location: "Houston",
      description: "x".repeat(501),
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Description too long");
  });

  test("POST /events handles DB errors (500)", async () => {
    model.createEvent.mockRejectedValue(new Error("Insert fail"));

    const res = await request(app).post("/events").send({
      title: "Event",
      date: "2025-10-27",
      location: "Houston",
    });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Insert fail");
  });

  // ----------------------------------------------------------
  // PUT /events/:id
  // ----------------------------------------------------------
  test("PUT /events/:id updates event", async () => {
    model.updateEvent.mockResolvedValue({ id: 1, title: "Updated Event" });

    const res = await request(app)
      .put("/events/1")
      .send({ title: "Updated Event" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, title: "Updated Event" });
  });

  test("PUT /events/:id returns 404 when event not found", async () => {
    model.updateEvent.mockResolvedValue(null);

    const res = await request(app).put("/events/999").send({ title: "X" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("event not found");
  });

  test("PUT /events/:id handles DB errors (500)", async () => {
    model.updateEvent.mockRejectedValue(new Error("Update error"));

    const res = await request(app).put("/events/1").send({ title: "X" });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Update error");
  });

  // ----------------------------------------------------------
  // DELETE /events/:id
  // ----------------------------------------------------------
  test("DELETE /events/:id deletes event", async () => {
    model.deleteEvent.mockResolvedValue(true);

    const res = await request(app).delete("/events/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("event deleted successfully");
  });

  test("DELETE /events/:id returns 404 when not found", async () => {
    model.deleteEvent.mockResolvedValue(false);

    const res = await request(app).delete("/events/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("event not found");
  });

  test("DELETE /events/:id handles DB errors (500)", async () => {
    model.deleteEvent.mockRejectedValue(new Error("Delete failed"));

    const res = await request(app).delete("/events/1");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Delete failed");
  });
});