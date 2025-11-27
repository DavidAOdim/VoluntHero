// backend/tests/matchingService.test.js

jest.mock("../../db", () => ({
  query: jest.fn(),
}));
const db = require("../../db");
const service = require("../src/modules/VolunteerMatching/service");

describe("Matching Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findMatches returns scored and sorted matches", async () => {
    // 1st query: getEvent
    db.query
      .mockResolvedValueOnce([
        [
          {
            id: 3,
            title: "Senior Care Visit",
            date: "2025-11-25",
            location: "Houston, TX",
            requiredSkills: '["compassion", "communication"]',
          },
        ],
      ])
      // 2nd query: getVolunteers
      .mockResolvedValueOnce([
        [
          {
            email: "v1@example.com",
            fullName: "Good Match",
            skills: '["compassion","communication"]',
            availability: '["2025-11-25"]',
            city: "Houston",
            state: "TX",
          },
          {
            email: "v2@example.com",
            fullName: "Low Match",
            skills: '["other"]',
            availability: "[]",
            city: "Dallas",
            state: "TX",
          },
        ],
      ]);

    const matches = await service.findMatches(3);

    expect(matches).toHaveLength(2);
    // Best match first
    expect(matches[0].volunteerEmail).toBe("v1@example.com");
    expect(matches[0].matchScore).toBeGreaterThan(matches[1].matchScore);
    expect(matches[0].reason).toContain("Skills:");
    expect(matches[0].reason).toContain("Same city");
    expect(matches[0].reason).toContain("Available on date");
  });

  test("assignVolunteer inserts into volunteer_history and returns id", async () => {
    // 1st query: getEvent(eventId)
    db.query
      .mockResolvedValueOnce([
        [
          {
            id: 3,
            title: "Senior Care Visit",
            date: "2025-11-25",
            location: "Houston, TX",
            requiredSkills: "[]",
          },
        ],
      ])
      // 2nd query: INSERT into volunteer_history
      .mockResolvedValueOnce([{ insertId: 99 }]);

    const id = await service.assignVolunteer(
      "vol@example.com",
      "Volunteer One",
      3
    );

    expect(id).toBe(99);
    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[1][0]).toContain(
      "INSERT INTO volunteer_history"
    );
  });
});
