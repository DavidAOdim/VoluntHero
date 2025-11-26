// backend/src/tests/historyService.test.js

const db = require("../../db");
jest.mock("../../db", () => ({
  query: jest.fn(),
}));

const history = require("../modules/VolunteerHistory/service");

describe("History Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getVolunteerHistory returns parsed rows", async () => {
    db.query.mockResolvedValueOnce([
      [
        {
          id: 1,
          volunteerId: null,
          volunteerName: "Arthur",
          eventId: 3,
          eventName: "Senior Care Visit",
          eventDate: "2025-11-25",
          eventLocation: "Houston",
          participationStatus: "registered",
          hoursVolunteered: 0,
          skillsUsed: '["communication"]',
          feedback: "",
          rating: 0,
        },
      ],
    ]);

    const result = await history.getVolunteerHistory("senior@example.com");

    expect(result[0].volunteerName).toBe("Arthur");
    expect(result[0].skillsUsed).toEqual(["communication"]);
  });
});

