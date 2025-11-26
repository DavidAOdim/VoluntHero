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
      [email]
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


// const db = require("../../../../db");

// class VolunteerHistoryService {
//   /**
//    * Get all history records for a volunteer from the DB.
//    * Uses the `volunteer_history` table (the correct, richer one).
//    */
//   async getVolunteerHistory(volunteerId) {
//     const [rows] = await db.query(
//       `
//       SELECT
//         id,
//         volunteerId,
//         volunteerName,
//         eventId,
//         eventName,
//         eventDate,
//         eventLocation,
//         participationStatus,
//         hoursVolunteered,
//         skillsUsed,
//         feedback,
//         rating,
//         createdAt
//       FROM volunteer_history
//       WHERE volunteerId = ?
//       ORDER BY eventDate DESC, createdAt DESC
//       `,
//       [parseInt(volunteerId, 10)]
//     );

//     // Parse JSON skillsUsed into JS arrays
//     return rows.map((row) => ({
//       ...row,
//       skillsUsed: row.skillsUsed
//         ? Array.isArray(row.skillsUsed)
//           ? row.skillsUsed
//           : JSON.parse(row.skillsUsed)
//         : [],
//     }));
//   }

//   /**
//    * Add a new history record.
//    * For now we derive simple placeholder names so the insert works.
//    * If you later want to fully join with events & user profile, we can extend this.
//    */
//   async addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback) {
//     const vId = parseInt(volunteerId, 10);
//     const eId = parseInt(eventId, 10);

//     // Basic sane defaults
//     const status = participationStatus || "registered";
//     const hrs = hours != null ? Number(hours) : 0;
//     const fb = feedback || "";

//     // Placeholder names; can be replaced later with actual joins if needed
//     const volunteerName = `Volunteer ${vId}`;
//     const eventName = `Event ${eId}`;
//     const eventLocation = "Unknown location";

//     // Insert into DB
//     const [result] = await db.query(
//       `
//       INSERT INTO volunteer_history
//         (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
//          participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//       VALUES
//         (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         vId,
//         volunteerName,
//         eId,
//         eventName,
//         eventLocation,
//         status,
//         hrs,
//         JSON.stringify([]), // skillsUsed
//         fb,
//         0, // rating
//       ]
//     );

//     // Return the inserted record
//     const [rows] = await db.query(
//       `SELECT * FROM volunteer_history WHERE id = ?`,
//       [result.insertId]
//     );

//     const row = rows[0];
//     return {
//       ...row,
//       skillsUsed: row.skillsUsed
//         ? Array.isArray(row.skillsUsed)
//           ? row.skillsUsed
//           : JSON.parse(row.skillsUsed)
//         : [],
//     };
//   }

//   /**
//    * Compute stats for a volunteer from the DB data.
//    */
//   async getVolunteerStats(volunteerId) {
//     const history = await this.getVolunteerHistory(volunteerId);

//     const totalHours = history.reduce(
//       (sum, record) => sum + (Number(record.hoursVolunteered) || 0),
//       0
//     );

//     const completedEvents = history.filter(
//       (record) => record.participationStatus === "completed"
//     ).length;

//     const uniqueSkills = [
//       ...new Set(
//         history.flatMap((record) =>
//           Array.isArray(record.skillsUsed) ? record.skillsUsed : []
//         )
//       ),
//     ];

//     const sortedByDate = [...history].sort(
//       (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
//     );

//     return {
//       volunteerId: parseInt(volunteerId, 10),
//       totalEvents: history.length,
//       completedEvents,
//       totalHours,
//       skillsUsed: uniqueSkills,
//       firstEvent: sortedByDate[0]?.eventDate || null,
//       lastEvent: sortedByDate[sortedByDate.length - 1]?.eventDate || null,
//     };
//   }
// }

// module.exports = new VolunteerHistoryService();

// class VolunteerHistoryService {
//     volunteerHistory = [
//         {
//             id: 1,
//             volunteerId: 1,
//             volunteerName: "John Doe",
//             eventId: 1,
//             eventName: "Community Cleanup",
//             eventDate: "2024-01-10",
//             eventLocation: "Central Park, NY",
//             participationStatus: "completed",
//             hoursVolunteered: 4,
//             skillsUsed: ["organizing", "teamwork"],
//             feedback: "Excellent participation",
//             rating: 5
//         },
//         {
//             id: 2,
//             volunteerId: 1,
//             volunteerName: "John Doe", 
//             eventId: 2,
//             eventName: "Food Drive",
//             eventDate: "2024-01-05",
//             eventLocation: "Brooklyn Shelter, NY",
//             participationStatus: "completed",
//             hoursVolunteered: 6,
//             skillsUsed: ["cooking", "serving"],
//             feedback: "Very helpful volunteer",
//             rating: 4
//         },
//         {
//             id: 3,
//             volunteerId: 2,
//             volunteerName: "Jane Smith",
//             eventId: 1,
//             eventName: "Community Cleanup",
//             eventDate: "2024-01-10",
//             eventLocation: "Central Park, NY",
//             participationStatus: "completed",
//             hoursVolunteered: 3,
//             skillsUsed: ["organizing"],
//             feedback: "Good team player",
//             rating: 4
//         }
//     ];

//     async getVolunteerHistory(volunteerId) {
//         return this.volunteerHistory.filter(record => 
//             record.volunteerId === parseInt(volunteerId)
//         );
//     }

//     async addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback) {
//         const newRecord = {
//             id: Date.now(),
//             volunteerId: parseInt(volunteerId),
//             volunteerName: `Volunteer ${volunteerId}`,
//             eventId: parseInt(eventId),
//             eventName: `Event ${eventId}`,
//             eventDate: new Date().toISOString().split('T')[0],
//             eventLocation: "New York, NY",
//             participationStatus: participationStatus || "registered",
//             hoursVolunteered: hours || 0,
//             skillsUsed: [],
//             feedback: feedback || "",
//             rating: 0
//         };

//         this.volunteerHistory.push(newRecord);
//         return newRecord;
//     }

//     async getVolunteerStats(volunteerId) {
//         const volunteerHistory = await this.getVolunteerHistory(volunteerId);
        
//         const totalHours = volunteerHistory.reduce((sum, record) => 
//             sum + record.hoursVolunteered, 0
//         );
        
//         const completedEvents = volunteerHistory.filter(record => 
//             record.participationStatus === "completed"
//         ).length;

//         const uniqueSkills = [...new Set(
//             volunteerHistory.flatMap(record => record.skillsUsed)
//         )];

//         return {
//             volunteerId: parseInt(volunteerId),
//             totalEvents: volunteerHistory.length,
//             completedEvents,
//             totalHours,
//             skillsUsed: uniqueSkills,
//             firstEvent: volunteerHistory.length > 0 ? volunteerHistory[volunteerHistory.length - 1].eventDate : null,
//             lastEvent: volunteerHistory.length > 0 ? volunteerHistory[0].eventDate : null
//         };
//     }
// }

// module.exports = new VolunteerHistoryService();