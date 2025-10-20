const request = require("supertest");
const app = require("../src/server");

describe("Notification API", () => {
  it("should return notifications for volunteer123", async () => {
    const response = await request(app).get("/notifications?userId=volunteer123");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should add a new notification", async () => {
    const newNotif = {
      userId: "volunteer123",
      message: "New test notification",
      type: "info",
    };

    const response = await request(app)
      .post("/notifications")
      .send(newNotif)
      .set("Content-Type", "application/json");

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "New test notification");
  });

  it("should mark a notification as read", async () => {
    const response = await request(app).patch("/notifications/1/read");
    expect(response.status).toBe(200);
    expect(response.body.read).toBe(true);
  });

  it("should delete a notification", async () => {
    const response = await request(app).delete("/notifications/2");
    expect(response.status).toBe(204);
  });

    it("should return 404 if notification not found when marking as read", async () => {
    const response = await request(app).patch("/notifications/999/read");
    expect(response.status).toBe(404);
  });

  it("should return 404 if trying to delete a non-existing notification", async () => {
    const response = await request(app).delete("/notifications/999");
    expect(response.status).toBe(404);
  });

  it("should default to type 'info' when not provided", async () => {
  const response = await request(app)
    .post("/notifications")
    .send({
      userId: "volunteer123",
      message: "Notification without type"
    })
    .set("Content-Type", "application/json");

  expect(response.status).toBe(201);
  expect(response.body.type).toBe("info"); // this covers the default branch
});


});
