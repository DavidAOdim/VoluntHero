// backend/tests/matchingController.test.js

jest.mock("../src/modules/VolunteerMatching/service", () => ({
  findMatches: jest.fn(),
  assignVolunteer: jest.fn(),
  getAssigned: jest.fn(),
}));

const service = require("../src/modules/VolunteerMatching/service");
const controller = require("../src/modules/VolunteerMatching/controller");

describe("Matching Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  test("getMatches returns matches", async () => {
    req.params.eventId = "3";
    service.findMatches.mockResolvedValueOnce([{ volunteerEmail: "v@test" }]);

    await controller.getMatches(req, res);

    expect(service.findMatches).toHaveBeenCalledWith("3");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      matches: [{ volunteerEmail: "v@test" }],
    });
  });

  test("assign validates missing fields", async () => {
    req.body = {}; // missing everything

    await controller.assign(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing volunteerEmail / volunteerName / eventId",
    });
  });

  test("assign calls service and returns success", async () => {
    req.body = {
      volunteerEmail: "v@test.com",
      volunteerName: "Volunteer",
      eventId: 5,
    };

    service.assignVolunteer.mockResolvedValueOnce(123);

    await controller.assign(req, res);

    expect(service.assignVolunteer).toHaveBeenCalledWith(
      "v@test.com",
      "Volunteer",
      5
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Volunteer assigned successfully",
      id: 123,
    });
  });

  test("getAssigned returns assigned list", async () => {
    req.params.eventId = "7";
    service.getAssigned.mockResolvedValueOnce([{ id: 1 }]);

    await controller.getAssigned(req, res);

    expect(service.getAssigned).toHaveBeenCalledWith("7");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      assigned: [{ id: 1 }],
    });
  });
});
