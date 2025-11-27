// backend/src/modules/VolunteerHistory/service.js

const db = require("../../../../db");

function safeParseJson(value) {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return [];
  }
}

class VolunteerHistoryService {
  /**
   * Get all history records for a volunteer from the DB.
   * Uses the canonical `volunteer_history` table.
   */
  async getVolunteerHistory(volunteerId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        volunteerId,
        volunteerName,
        eventId,
        eventName,
        eventDate,
        eventLocation,
        participationStatus,
        hoursVolunteered,
        skillsUsed,
        feedback,
        rating,
        createdAt
      FROM volunteer_history
      WHERE volunteerId = ?
      ORDER BY eventDate DESC, createdAt DESC
      `,
      [volunteerId]
    );

    return rows.map((row) => ({
      ...row,
      skillsUsed: safeParseJson(row.skillsUsed),
    }));
  }

  /**
   * Add a new history record manually (if needed).
   * Matching normally calls this logic via its own assign function,
   * but you can still expose this for other uses.
   */
  async addHistoryRecord(
    volunteerId,
    eventId,
    participationStatus,
    hours,
    feedback
  ) {
    const vId = parseInt(volunteerId, 10);
    const eId = parseInt(eventId, 10);

    const status = participationStatus || "registered";
    const hrs = hours != null ? Number(hours) : 0;
    const fb = feedback || "";

    // Try to load event info for nicer data
    const [eventRows] = await db.query(
      `
      SELECT id, title, date, location
      FROM events
      WHERE id = ?
      `,
      [eId]
    );

    const event =
      eventRows[0] || {
        id: eId,
        title: `Event ${eId}`,
        date: new Date(),
        location: "Unknown",
      };

    const eventDate = event.date
      ? new Date(event.date).toISOString().slice(0, 10)
      : null;

    const eventLocation = event.location || "Unknown location";

    // Try to load volunteer name from UserCredentials/UserProfile
    const [volRows] = await db.query(
      `
      SELECT 
        u.id       AS userId,
        u.email    AS email,
        u.name     AS username,
        p.fullName AS fullName
      FROM UserCredentials u
      LEFT JOIN UserProfile p
        ON u.email = p.email
      WHERE u.id = ?
      `,
      [vId]
    );

    const vol = volRows[0] || {};
    const volunteerName =
      vol.fullName ||
      vol.username ||
      vol.email ||
      `Volunteer ${vId}`;

    const [result] = await db.query(
      `
      INSERT INTO volunteer_history
        (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
         participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vId,
        volunteerName,
        event.id,
        event.title,
        eventDate,
        eventLocation,
        status,
        hrs,
        JSON.stringify([]),
        fb,
        0,
      ]
    );

    const [rows] = await db.query(
      `SELECT * FROM volunteer_history WHERE id = ?`,
      [result.insertId]
    );

    const row = rows[0];

    return {
      ...row,
      skillsUsed: safeParseJson(row.skillsUsed),
    };
  }

  /**
   * Compute stats for a volunteer from the DB data.
   */
  async getVolunteerStats(volunteerId) {
    const history = await this.getVolunteerHistory(volunteerId);

    const totalHours = history.reduce(
      (sum, record) => sum + (Number(record.hoursVolunteered) || 0),
      0
    );

    const completedEvents = history.filter(
      (record) => record.participationStatus === "completed"
    ).length;

    const uniqueSkills = [
      ...new Set(
        history.flatMap((record) =>
          Array.isArray(record.skillsUsed) ? record.skillsUsed : []
        )
      ),
    ];

    const sortedByDate = [...history].sort(
      (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
    );

    return {
      volunteerId: parseInt(volunteerId, 10),
      totalEvents: history.length,
      completedEvents,
      totalHours,
      skillsUsed: uniqueSkills,
      firstEvent: sortedByDate[0]?.eventDate || null,
      lastEvent: sortedByDate[sortedByDate.length - 1]?.eventDate || null,
    };
  }
}

module.exports = new VolunteerHistoryService();

