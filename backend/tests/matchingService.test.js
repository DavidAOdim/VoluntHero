// backend/src/tests/matchingService.test.js

const db = require("../../db");
jest.mock("../../db", () => ({
  query: jest.fn(),
}));

const service = require("../modules/VolunteerMatching/service");

describe("Matching Service", () => {
  beforeEach(() => jest.clearAllMocks());

  test("getEvent returns event data", async () => {
    db.query.mockResolvedValueOnce([
      [
        {
          id: 3,
          title: "Senior Care Visit",
          date: "2025-11-25",
          location: "Houston, TX",
          requiredSkills: '["compassion"]',
        },
      ],
    ]);

    const result = await service.getEvent(3);
    expect(result.title).toBe("Senior Care Visit");
    expect(result.requiredSkills).toEqual(["compassion"]);
  });

  test("getVolunteers returns users from UserProfile", async () => {
    db.query.mockResolvedValueOnce([
      [
        {
          email: "test@example.com",
          fullName: "Test User",
          skills: '["Cooking"]',
          availability: '["Monday"]',
          city: "Houston",
          state: "TX",
        },
      ],
    ]);

    const result = await service.getVolunteers();
    expect(result[0].fullName).toBe("Test User");
    expect(result[0].skills).toEqual(["Cooking"]);
  });
});
