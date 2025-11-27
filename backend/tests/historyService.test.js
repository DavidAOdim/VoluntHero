// backend/tests/historyService.test.js

jest.mock("../../db", () => ({
  query: jest.fn(),
}));
const db = require("../../db");
const history = require("../src/modules/VolunteerHistory/service");

describe("History Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getVolunteerHistory returns parsed rows", async () => {
    db.query.mockResolvedValueOnce([
      [
        {
          id: 1,
          volunteerId: 42,
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

    const result = await history.getVolunteerHistory(42);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("FROM volunteer_history"),
      [42]
    );
    expect(result).toHaveLength(1);
    expect(result[0].volunteerName).toBe("Arthur");
    expect(result[0].skillsUsed).toEqual(["communication"]);
  });

  test("getVolunteerStats aggregates correctly", async () => {
    // First call: internal getVolunteerHistory -> db.query
    db.query.mockResolvedValueOnce([
      [
        {
          id: 1,
          volunteerId: 42,
          volunteerName: "Arthur",
          eventId: 3,
          eventName: "Senior Care Visit",
          eventDate: "2025-11-25",
          eventLocation: "Houston",
          participationStatus: "completed",
          hoursVolunteered: 5,
          skillsUsed: '["communication", "empathy"]',
          feedback: "",
          rating: 5,
        },
        {
          id: 2,
          volunteerId: 42,
          volunteerName: "Arthur",
          eventId: 4,
          eventName: "Heart Walk",
          eventDate: "2025-12-01",
          eventLocation: "Houston",
          participationStatus: "registered",
          hoursVolunteered: 2,
          skillsUsed: '["communication"]',
          feedback: "",
          rating: 4,
        },
      ],
    ]);

    const stats = await history.getVolunteerStats(42);

    expect(stats.volunteerId).toBe(42);
    expect(stats.totalEvents).toBe(2);
    expect(stats.completedEvents).toBe(1);
    expect(stats.totalHours).toBe(7);
    expect(stats.skillsUsed.sort()).toEqual(
      ["communication", "empathy"].sort()
    );
    expect(stats.firstEvent).toBe("2025-11-25");
    expect(stats.lastEvent).toBe("2025-12-01");
  });
});
