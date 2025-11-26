// backend/src/tests/matchingController.test.js

const controller = require("../modules/VolunteerMatching/controller");
const service = require("../modules/VolunteerMatching/service");

jest.mock("../modules/VolunteerMatching/service");

describe("Matching Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  test("getMatches returns matches", async () => {
    req.params.eventId = 3;

    service.findMatches.mockResolvedValue([{ volunteerEmail: "a@b.com" }]);

    await controller.getMatches(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      matches: [{ volunteerEmail: "a@b.com" }],
    });
  });

  test("assign calls service correctly", async () => {
    req.body = {
      volunteerEmail: "test@example.com",
      volunteerName: "Test User",
      eventId: 3,
    };

    service.assignVolunteer.mockResolvedValue(1);

    await controller.assign(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Volunteer assigned successfully",
      id: 1,
    });
  });
});
