// backend/src/modules/VolunteerHistory/service.js
const db = require("../../utils/dbConnect");

function safeJSON(value, fallback = []) {
  try {
    if (value == null || value === "") return Array.isArray(fallback) ? fallback : [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return Array.isArray(fallback) ? fallback : [];
  }
}

class VolunteerHistoryService {
  async getVolunteerHistory(volunteerId) {
    const [rows] = await db
      .promise()
      .query(
        `SELECT id, volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
                participationStatus, hoursVolunteered, skillsUsed, feedback, rating, createdAt
         FROM volunteer_history
         WHERE volunteerId = ?
         ORDER BY eventDate DESC, id DESC`,
        [volunteerId]
      );

    if (!rows.length) return [];

    return rows.map((r) => ({
      ...r,
      skillsUsed: safeJSON(r.skillsUsed, []),
    }));
  }

  async addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback) {
    // Look up the event for denormalized columns
    const [[evtRow]] = await db
      .promise()
      .query("SELECT id, name, title, location, date FROM events WHERE id = ?", [eventId]);
    if (!evtRow) throw new Error("Event not found");

    const eventName = evtRow.name ?? evtRow.title ?? `Event #${evtRow.id}`;
    const eventDate = evtRow.date ? new Date(evtRow.date) : new Date(); // normalize
    const eventLocation = evtRow.location ?? "TBD";

    // Try volunteers table first, fallback to profiles
    const [[volRow]] = await db
      .promise()
      .query(
        `SELECT id, name, email FROM volunteers WHERE id = ?
         UNION
         SELECT id, fullName AS name, email FROM profiles WHERE id = ?`,
        [volunteerId, volunteerId]
      );
    const volunteerName = volRow?.name ?? `Volunteer #${volunteerId}`;

    const [ins] = await db
      .promise()
      .query(
        `INSERT INTO volunteer_history
         (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
          participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          volunteerId,
          volunteerName,
          eventId,
          eventName,
          eventDate,
          eventLocation,
          participationStatus ?? "registered",
          hours ?? 0,
          JSON.stringify([]),
          feedback ?? "",
          0,
        ]
      );

    return {
      id: ins.insertId,
      volunteerId: Number(volunteerId),
      volunteerName,
      eventId: Number(eventId),
      eventName,
      eventDate,
      eventLocation,
      participationStatus: participationStatus ?? "registered",
      hoursVolunteered: hours ?? 0,
      skillsUsed: [],
      feedback: feedback ?? "",
      rating: 0,
    };
  }

  async getVolunteerStats(volunteerId) {
    const history = await this.getVolunteerHistory(volunteerId);
    if (!history.length) {
      return {
        volunteerId: Number(volunteerId),
        totalEvents: 0,
        completedEvents: 0,
        totalHours: 0,
        skillsUsed: [],
        firstEvent: null,
        lastEvent: null,
      };
    }

    const totalHours = history.reduce((sum, r) => sum + (r.hoursVolunteered || 0), 0);
    const completedEvents = history.filter((r) => r.participationStatus === "completed").length;
    const allSkills = history.flatMap((r) => safeJSON(r.skillsUsed, []));
    const uniqueSkills = [...new Set(allSkills)];

    return {
      volunteerId: Number(volunteerId),
      totalEvents: history.length,
      completedEvents,
      totalHours,
      skillsUsed: uniqueSkills,
      firstEvent: history[history.length - 1]?.eventDate ?? null,
      lastEvent: history[0]?.eventDate ?? null,
    };
  }
}

module.exports = new VolunteerHistoryService();


// // backend/src/modules/VolunteerHistory/service.js
// const path = require('path');
// //const db = require(path.resolve(__dirname, '../../../../db'));
// const db = require("../../utils/dbConnect");

// function safeJSON(value, fallback = []) {
//   try {
//     if (value == null || value === '') return Array.isArray(fallback) ? fallback : [];
//     if (Array.isArray(value)) return value;
//     return JSON.parse(value);
//   } catch {
//     return Array.isArray(fallback) ? fallback : [];
//   }
// }

// class VolunteerHistoryService {
//   async getVolunteerHistory(volunteerId) {
//     const [rows] = await db
//       .promise()
//       .query(
//         `SELECT id, volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
//                 participationStatus, hoursVolunteered, skillsUsed, feedback, rating, createdAt
//          FROM volunteer_history
//          WHERE volunteerId = ?
//          ORDER BY eventDate DESC, id DESC`,
//         [volunteerId]
//       );
//     return rows.map((r) => ({
//       ...r,
//       skillsUsed: safeJSON(r.skillsUsed, [])
//     }));
//   }

//   async addHistoryRecord(volunteerId, eventId, participationStatus, hours, feedback) {
//     // Minimal event/volunteer lookups to fill denormalized columns
//     const [[evtRow]] = await db
//       .promise()
//       .query('SELECT id, name, title, location, date FROM events WHERE id = ?', [eventId]);
//     if (!evtRow) throw new Error('Event not found');

//     const eventName = evtRow.name ?? evtRow.title ?? `Event #${evtRow.id}`;
//     const eventDate = evtRow.date ?? new Date();
//     const eventLocation = evtRow.location ?? 'TBD';

//     const [[volRow]] = await db
//       .promise()
//       .query(
//         `SELECT id, name, email FROM volunteers WHERE id = ?
//          UNION
//          SELECT id, fullName as name, email FROM profiles WHERE id = ?`,
//         [volunteerId, volunteerId]
//       );
//     const volunteerName = volRow?.name ?? `Volunteer #${volunteerId}`;

//     const [ins] = await db
//       .promise()
//       .query(
//         `INSERT INTO volunteer_history
//          (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           volunteerId,
//           volunteerName,
//           eventId,
//           eventName,
//           eventDate,
//           eventLocation,
//           participationStatus ?? 'registered',
//           hours ?? 0,
//           JSON.stringify([]),
//           feedback ?? '',
//           0
//         ]
//       );

//     return {
//       id: ins.insertId,
//       volunteerId: Number(volunteerId),
//       volunteerName,
//       eventId: Number(eventId),
//       eventName,
//       eventDate,
//       eventLocation,
//       participationStatus: participationStatus ?? 'registered',
//       hoursVolunteered: hours ?? 0,
//       skillsUsed: [],
//       feedback: feedback ?? '',
//       rating: 0
//     };
//   }

//   async getVolunteerStats(volunteerId) {
//     const history = await this.getVolunteerHistory(volunteerId);
//     if (!history.length) {
//       return {
//         volunteerId,
//         totalEvents: 0,
//         completedEvents: 0,
//         totalHours: 0,
//         skillsUsed: [],
//         firstEvent: null,
//         lastEvent: null
//       };
//     }

//     const totalHours = history.reduce((sum, r) => sum + (r.hoursVolunteered || 0), 0);
//     const completedEvents = history.filter((r) => r.participationStatus === 'completed').length;
//     const allSkills = history.flatMap((r) => safeJSON(r.skillsUsed, []));
//     const uniqueSkills = [...new Set(allSkills)];
//     return {
//       volunteerId,
//       totalEvents: history.length,
//       completedEvents,
//       totalHours,
//       skillsUsed: uniqueSkills,
//       firstEvent: history[history.length - 1]?.eventDate ?? null,
//       lastEvent: history[0]?.eventDate ?? null
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