// backend/src/tests/historyController.test.js

const controller = require("../modules/VolunteerHistory/controller");
const db = require("../../db");

jest.mock("../../db", () => ({
  query: jest.fn(),
}));

describe("History Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
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
});
