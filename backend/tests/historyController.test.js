// backend/tests/historyController.test.js

const controller = require("../src/modules/VolunteerHistory/controller");
jest.mock("../../db", () => ({
  query: jest.fn(),
}));
const db = require("../../db");

describe("History Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    db.query.mockReset();
  });

  test("returns history by email", async () => {
    req.params.email = "senior@example.com";

    db.query.mockResolvedValueOnce([
      [
        {
          id: 1,
          volunteerEmail: "senior@example.com",
          eventName: "Senior Care Visit",
        },
      ],
    ]);

    await controller.getHistoryByEmail(req, res);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("WHERE volunteerEmail = ?"),
      ["senior@example.com"]
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        {
          id: 1,
          volunteerEmail: "senior@example.com",
          eventName: "Senior Care Visit",
        },
      ],
    });
  });

  test("handles DB error for getHistoryByEmail", async () => {
    req.params.email = "oops@example.com";
    db.query.mockRejectedValueOnce(new Error("DB error"));

    await controller.getHistoryByEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "DB error",
    });
  });
});
