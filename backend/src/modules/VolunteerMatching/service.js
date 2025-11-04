// backend/src/modules/VolunteerMatching/service.js
const db = require("../../utils/dbConnect");

/** Safe JSON parse that gracefully accepts arrays or strings */
function toArray(maybeJSON, fallback = []) {
  try {
    if (Array.isArray(maybeJSON)) return maybeJSON;
    if (maybeJSON == null || maybeJSON === "") return [...fallback];
    const parsed = JSON.parse(maybeJSON);
    return Array.isArray(parsed) ? parsed : [...fallback];
  } catch {
    return [...fallback];
  }
}

/** Normalize a text (for city comparisons) */
function cityOf(location = "") {
  // e.g., "New York, NY" -> "new york"
  return String(location).split(",")[0].trim().toLowerCase();
}

/** Map urgency to a normalized [0..1] score */
function urgencyScore(urgencyRaw) {
  const u = String(urgencyRaw || "Low").toLowerCase();
  if (u === "high") return 1;
  if (u === "medium") return 0.5;
  return 0; // Low or unknown
}

/** Date helper: exact match or ±2-day window counts as available */
function availabilityHit(volAvailability, eventDateISO) {
  if (!eventDateISO) return 0;
  const eventDate = new Date(eventDateISO);
  if (Number.isNaN(eventDate.getTime())) return 0;

  for (const d of volAvailability || []) {
    const vd = new Date(d);
    if (Number.isNaN(vd.getTime())) continue;
    const deltaDays = Math.abs((vd - eventDate) / (1000 * 60 * 60 * 24));
    if (deltaDays <= 2) return 1; // within ±2 days
  }
  return 0;
}

class VolunteerMatchingService {
  // ---------- Data Loads ----------
  async getVolunteers() {
    const [rows] = await db.promise().query("SELECT * FROM volunteers");
    return rows.map((v) => ({
      ...v,
      skills: toArray(v.skills, []),
      availability: toArray(v.availability, []),
    }));
  }

  async getEventById(eventId) {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM events WHERE id = ?", [eventId]);

    if (!rows.length) throw new Error("Event not found");

    const e = rows[0];
    return {
      ...e,
      requiredSkills: toArray(e.requiredSkills, []),
      urgency: e.urgency ?? "Low", // tolerate missing column
    };
  }

  // ---------- Core Scoring ----------
  /**
   * Weighted scoring:
   *  - Skills overlap: 50%
   *  - Location (same city boost): 25%
   *  - Availability (±2 days window): 15%
   *  - Urgency: 10% (High=1, Medium=0.5, Low=0)
   */
  computeScore(vol, event) {
    const req = event.requiredSkills || [];
    const have = vol.skills || [];
    const overlap = have.filter((s) => req.includes(s));
    const skillsMatch =
      req.length > 0 ? overlap.length / req.length : 0; // normalize

    const sameCity = cityOf(vol.location) === cityOf(event.location) ? 1 : 0;
    const avail = availabilityHit(vol.availability, event.date);
    const urg = urgencyScore(event.urgency);

    const score =
      skillsMatch * 0.5 + sameCity * 0.25 + avail * 0.15 + urg * 0.1;

    return {
      score: Math.round(score * 100) / 100, // 2 decimals
      matchingSkills: overlap,
      isAvailable: avail > 0,
      sameCity: sameCity === 1,
    };
  }

  // ---------- Public API ----------
  async findVolunteerMatches(eventId, { topN = 3, minScore = 0.3 } = {}) {
    const event = await this.getEventById(eventId);
    const volunteers = await this.getVolunteers();

    const ranked = volunteers
      .map((v) => {
        const result = this.computeScore(v, event);
        return {
          volunteer: {
            id: v.id,
            name: v.name,
            email: v.email,
            skills: v.skills,
            location: v.location,
            availability: v.availability,
          },
          matchScore: result.score,
          matchingSkills: result.matchingSkills,
          isAvailable: result.isAvailable,
          sameCity: result.sameCity,
          reason:
            result.matchingSkills.length > 0
              ? `Matches ${result.matchingSkills.length} required skill(s): ${result.matchingSkills.join(
                  ", "
                )}${result.sameCity ? " • Same city" : ""}${
                  result.isAvailable ? " • Available" : ""
                }`
              : `${result.sameCity ? "Same city" : "Different city"}${
                  result.isAvailable ? " • Available" : ""
                }`,
        };
      })
      .filter((m) => m.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, topN);

    return ranked;
  }

  /** Create assignment + record in volunteer_history (idempotent on volId+eventId) */
/** Create assignment + record in volunteer_history (idempotent on volId+eventId) */
async createVolunteerMatch(volunteerId, eventId) {
  const [[vol]] = await db
    .promise()
    .query("SELECT * FROM volunteers WHERE id = ?", [volunteerId]);
  const event = await this.getEventById(eventId);

  if (!vol) throw new Error("Volunteer not found");

  const volSkills = toArray(vol.skills, []);
  const overlap = (event.requiredSkills || []).filter((s) =>
    volSkills.includes(s)
  );

  // ✅ Prevent duplicate entry (idempotency)
  const [existing] = await db
    .promise()
    .query(
      "SELECT id FROM volunteer_history WHERE volunteerId = ? AND eventId = ? LIMIT 1",
      [volunteerId, eventId]
    );

  if (existing.length > 0) {
    return {
      success: true,
      message: "Volunteer already assigned to this event.",
      volunteerId,
      eventId,
      matchingSkills: overlap,
      duplicate: true,
    };
  }

  // Create new record if not existing
  await db
    .promise()
    .query(
      `INSERT INTO volunteer_history
       (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
        participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        volunteerId,
        vol.name ?? `Volunteer #${volunteerId}`,
        eventId,
        event.name ?? event.title ?? `Event #${eventId}`,
        event.date ?? new Date(),
        event.location ?? "TBD",
        "registered",
        0,
        JSON.stringify(overlap),
        "",
        0,
      ]
    );

  return {
    success: true,
    message: "Volunteer successfully assigned and recorded in history.",
    volunteerId,
    eventId,
    matchingSkills: overlap,
    duplicate: false,
  };
}


  /** Auto-match: assign top K volunteers for an event and record all in history */
  async autoAssignTop(eventId, topK = 2, minScore = 0.4) {
    const picks = await this.findVolunteerMatches(eventId, {
      topN: topK,
      minScore,
    });
    const results = [];
    for (const p of picks) {
      const r = await this.createVolunteerMatch(p.volunteer.id, eventId);
      results.push({
        volunteerId: p.volunteer.id,
        name: p.volunteer.name,
        score: p.matchScore,
        matchingSkills: p.matchingSkills,
        created: r.success && !r.message.includes("already"),
      });
    }
    return results;
  }
}

module.exports = new VolunteerMatchingService();

// // backend/src/modules/VolunteerMatching/service.js
// const path = require("path");
// const db = require(path.resolve(__dirname, "../../../../db"));

// // Safe JSON parser utility
// function safeJSON(str, fallback = []) {
//   try {
//     if (!str) return fallback;
//     const parsed = JSON.parse(str);
//     return Array.isArray(parsed) ? parsed : fallback;
//   } catch {
//     return fallback;
//   }
// }

// class VolunteerMatchingService {
//   // 🟢 Get all volunteers
//   async getVolunteers() {
//     const [rows] = await db.promise().query("SELECT * FROM volunteers");
//     return rows.map((v) => ({
//       ...v,
//       skills: safeJSON(v.skills, []),
//       availability: safeJSON(v.availability, []),
//     }));
//   }

//   // 🟢 Get all events
//   async getEvents() {
//     const [rows] = await db.promise().query("SELECT * FROM events");
//     return rows.map((e) => ({
//       ...e,
//       requiredSkills: safeJSON(e.requiredSkills, []),
//     }));
//   }

//   // 🧠 Compute matches for a given event
//   async findVolunteerMatches(eventId) {
//     const [eventRows] = await db
//       .promise()
//       .query("SELECT * FROM events WHERE id = ?", [eventId]);

//     if (!eventRows.length) throw new Error("Event not found");

//     const event = {
//       ...eventRows[0],
//       requiredSkills: safeJSON(eventRows[0].requiredSkills, []),
//     };

//     const volunteers = await this.getVolunteers();
//     const matches = volunteers.map((vol) => {
//       const matchingSkills = vol.skills.filter((s) =>
//         event.requiredSkills.includes(s)
//       );

//       const skillMatch = matchingSkills.length / event.requiredSkills.length || 0;
//       const availabilityMatch = vol.availability.includes(event.date) ? 1 : 0;
//       const locationMatch =
//         vol.location.split(",")[0].trim().toLowerCase() ===
//         event.location.split(",")[0].trim().toLowerCase()
//           ? 1
//           : 0.4;

//       const matchScore =
//         skillMatch * 0.6 + availabilityMatch * 0.25 + locationMatch * 0.15;

//       return {
//         volunteer: {
//           id: vol.id,
//           name: vol.name,
//           email: vol.email,
//           location: vol.location,
//           skills: vol.skills,
//           availability: vol.availability,
//         },
//         event: {
//           id: event.id,
//           name: event.name,
//           date: event.date,
//           location: event.location,
//         },
//         matchScore: Math.round(matchScore * 100) / 100,
//         matchingSkills,
//         isAvailable: availabilityMatch > 0,
//         reason:
//           matchingSkills.length > 0
//             ? `Matches ${matchingSkills.length} skills: ${matchingSkills.join(", ")}`
//             : "Few matching skills",
//       };
//     });

//     // Filter and sort matches
//     const sorted = matches
//       .filter((m) => m.matchScore > 0.3)
//       .sort((a, b) => b.matchScore - a.matchScore);

//     return {
//       success: true,
//       data: sorted,
//       message: `${sorted.length} matches found for event "${event.name}"`,
//     };
//   }

//   // 🧾 Assign a volunteer to an event
//   async createVolunteerMatch(volunteerId, eventId) {
//     const [[volunteer]] = await db
//       .promise()
//       .query("SELECT * FROM volunteers WHERE id = ?", [volunteerId]);
//     const [[event]] = await db
//       .promise()
//       .query("SELECT * FROM events WHERE id = ?", [eventId]);

//     if (!volunteer || !event) throw new Error("Volunteer or event not found");

//     // 🔍 Prevent duplicate assignment
//     const [existing] = await db
//       .promise()
//       .query(
//         "SELECT id FROM volunteer_history WHERE volunteerId = ? AND eventId = ?",
//         [volunteerId, eventId]
//       );

//     if (existing.length)
//       return {
//         success: false,
//         message: "This volunteer is already assigned to this event.",
//       };

//     // 📝 Insert into volunteer_history
//     await db.promise().query(
//       `INSERT INTO volunteer_history 
//         (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, skillsUsed)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         volunteer.id,
//         volunteer.name,
//         event.id,
//         event.name,
//         event.date,
//         event.location,
//         "assigned",
//         JSON.stringify(safeJSON(event.requiredSkills)),
//       ]
//     );

//     return {
//       success: true,
//       message: `Volunteer ${volunteer.name} successfully assigned to "${event.name}".`,
//       volunteerId,
//       eventId,
//     };
//   }
// }

// module.exports = new VolunteerMatchingService();

// // backend/src/modules/VolunteerMatching/service.js
// const path = require("path");
// const db = require(path.resolve(__dirname, "../../../../db"));

// /**
//  * Utility to safely parse JSON or fall back to comma-separated strings.
//  */
// function safeParseJSON(value) {
//   if (!value) return [];
//   try {
//     return JSON.parse(value);
//   } catch {
//     return value
//       .toString()
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean);
//   }
// }

// class VolunteerMatchingService {
//   // ✅ Fetch all volunteers from the database
//   async getVolunteers() {
//     try {
//       const [rows] = await db.promise().query("SELECT * FROM volunteers");
//       return rows.map((v) => ({
//         ...v,
//         skills: safeParseJSON(v.skills),
//         availability: safeParseJSON(v.availability),
//       }));
//     } catch (error) {
//       console.error("❌ Error fetching volunteers:", error);
//       throw error;
//     }
//   }

//   // ✅ Fetch all events from the database
//   async getEvents() {
//     try {
//       const [rows] = await db.promise().query("SELECT * FROM events");
//       return rows.map((e) => ({
//         ...e,
//         requiredSkills: safeParseJSON(e.requiredSkills),
//       }));
//     } catch (error) {
//       console.error("❌ Error fetching events:", error);
//       throw error;
//     }
//   }

//   // ✅ Find the best volunteers for a specific event
//   async findVolunteerMatches(eventId) {
//     try {
//       const [eventRows] = await db
//         .promise()
//         .query("SELECT * FROM events WHERE id = ?", [eventId]);

//       if (!eventRows.length) throw new Error("Event not found");

//       const event = {
//         ...eventRows[0],
//         requiredSkills: safeParseJSON(eventRows[0].requiredSkills),
//       };

//       const volunteers = await this.getVolunteers();

//       const matches = volunteers.map((vol) => {
//         const matchingSkills = vol.skills.filter((skill) =>
//           event.requiredSkills.includes(skill)
//         );

//         const skillsMatch =
//           event.requiredSkills.length > 0
//             ? matchingSkills.length / event.requiredSkills.length
//             : 0;

//         const locationMatch =
//           vol.location.split(",")[0].trim().toLowerCase() ===
//           event.location.split(",")[0].trim().toLowerCase()
//             ? 1
//             : 0.3;

//         const availabilityMatch = vol.availability.includes(event.date)
//           ? 1
//           : 0;

//         const matchScore =
//           skillsMatch * 0.5 + locationMatch * 0.3 + availabilityMatch * 0.2;

//         return {
//           volunteer: {
//             id: vol.id,
//             name: vol.name,
//             email: vol.email,
//             skills: vol.skills,
//             location: vol.location,
//             availability: vol.availability,
//           },
//           matchScore: Math.round(matchScore * 100) / 100,
//           matchingSkills,
//           isAvailable: availabilityMatch > 0,
//           reason:
//             matchingSkills.length > 0
//               ? `Matches ${matchingSkills.length} skills: ${matchingSkills.join(
//                   ", "
//                 )}`
//               : "Low match score",
//         };
//       });

//       return matches
//         .filter((m) => m.matchScore > 0.3)
//         .sort((a, b) => b.matchScore - a.matchScore);
//     } catch (error) {
//       console.error("❌ Error finding volunteer matches:", error);
//       throw error;
//     }
//   }

//   // ✅ Assign a volunteer to an event and update their history
//   async createVolunteerMatch(volunteerId, eventId) {
//     try {
//       const [volRows] = await db
//         .promise()
//         .query("SELECT * FROM volunteers WHERE id = ?", [volunteerId]);
//       const [eventRows] = await db
//         .promise()
//         .query("SELECT * FROM events WHERE id = ?", [eventId]);

//       if (!volRows.length || !eventRows.length) {
//         throw new Error("Volunteer or event not found");
//       }

//       const volunteer = {
//         ...volRows[0],
//         skills: safeParseJSON(volRows[0].skills),
//         availability: safeParseJSON(volRows[0].availability),
//       };
//       const event = {
//         ...eventRows[0],
//         requiredSkills: safeParseJSON(eventRows[0].requiredSkills),
//       };

//       // Record assignment in volunteer_history
//       await db.promise().query(
//         `INSERT INTO volunteer_history 
//         (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered, skillsUsed)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           volunteerId,
//           volunteer.name,
//           eventId,
//           event.name,
//           event.date,
//           event.location,
//           "registered",
//           0,
//           JSON.stringify(event.requiredSkills),
//         ]
//       );

//       return {
//         success: true,
//         message: "✅ Volunteer successfully assigned and recorded in history.",
//         volunteerId,
//         eventId,
//       };
//     } catch (error) {
//       console.error("❌ Error creating volunteer match:", error);
//       throw error;
//     }
//   }
// }

// module.exports = new VolunteerMatchingService();



// const db = require("../../../db");

// class VolunteerMatchingService {
//   // ✅ Fetch all volunteers
//   async getVolunteers() {
//     const [rows] = await db.promise().query("SELECT * FROM volunteers");
//     return rows.map(v => ({
//       ...v,
//       skills: JSON.parse(v.skills || "[]"),
//       availability: JSON.parse(v.availability || "[]"),
//     }));
//   }

//   // ✅ Fetch all events
//   async getEvents() {
//     const [rows] = await db.promise().query("SELECT * FROM events");
//     return rows.map(e => ({
//       ...e,
//       requiredSkills: JSON.parse(e.requiredSkills || "[]"),
//     }));
//   }

//   // ✅ Find matching volunteers for an event
//   async findVolunteerMatches(eventId) {
//     const [eventRows] = await db
//       .promise()
//       .query("SELECT * FROM events WHERE id = ?", [eventId]);

//     if (!eventRows.length) throw new Error("Event not found");

//     const event = {
//       ...eventRows[0],
//       requiredSkills: JSON.parse(eventRows[0].requiredSkills || "[]"),
//     };

//     const volunteers = await this.getVolunteers();

//     const matches = volunteers.map((vol) => {
//       const matchingSkills = vol.skills.filter(skill =>
//         event.requiredSkills.includes(skill)
//       );

//       const skillsMatch = matchingSkills.length / event.requiredSkills.length;
//       const locationMatch =
//         vol.location.split(",")[0].trim() === event.location.split(",")[0].trim()
//           ? 1
//           : 0.3;
//       const availabilityMatch = vol.availability.includes(event.date) ? 1 : 0;

//       const matchScore =
//         skillsMatch * 0.5 + locationMatch * 0.3 + availabilityMatch * 0.2;

//       return {
//         volunteer: {
//           id: vol.id,
//           name: vol.name,
//           skills: vol.skills,
//           location: vol.location,
//           availability: vol.availability,
//         },
//         matchScore: Math.round(matchScore * 100) / 100,
//         matchingSkills,
//         isAvailable: availabilityMatch > 0,
//         reason: matchingSkills.length
//           ? `Matches ${matchingSkills.length} skills: ${matchingSkills.join(", ")}`
//           : "Low match score",
//       };
//     });

//     return matches
//       .filter(m => m.matchScore > 0.3)
//       .sort((a, b) => b.matchScore - a.matchScore);
//   }

//   // ✅ Assign volunteer to event and update history
//   async createVolunteerMatch(volunteerId, eventId) {
//     const [volRows] = await db
//       .promise()
//       .query("SELECT * FROM volunteers WHERE id = ?", [volunteerId]);
//     const [eventRows] = await db
//       .promise()
//       .query("SELECT * FROM events WHERE id = ?", [eventId]);

//     if (!volRows.length || !eventRows.length)
//       throw new Error("Volunteer or event not found");

//     const volunteer = volRows[0];
//     const event = eventRows[0];

//     await db.promise().query(
//       `INSERT INTO volunteer_history 
//       (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered, skillsUsed)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [
//         volunteerId,
//         volunteer.name,
//         eventId,
//         event.name,
//         event.date,
//         event.location,
//         "registered",
//         0,
//         event.requiredSkills || "[]",
//       ]
//     );

//     return { success: true, volunteerId, eventId };
//   }
// }

// module.exports = new VolunteerMatchingService();

// // backend/src/modules/VolunteerMatching/service.js
// // ===============================================
// // Volunteer Matching Service (DB-backed, resilient to column name drift)
// // ===============================================
// const path = require('path');
// const db = require(path.resolve(__dirname, '../../../../db'));

// function safeJSON(value, fallback = []) {
//   try {
//     if (value == null || value === '') return Array.isArray(fallback) ? fallback : [];
//     if (Array.isArray(value)) return value;
//     return JSON.parse(value);
//   } catch {
//     return Array.isArray(fallback) ? fallback : [];
//   }
// }

// function pickName(row) {
//   // Events may use "name" or "title"
//   return row.name ?? row.title ?? 'Untitled';
// }

// function pickSkills(row) {
//   // Events may use "requiredSkills" or "skills"
//   return safeJSON(row.requiredSkills ?? row.skills ?? '[]', []);
// }

// class VolunteerMatchingService {
//   // Attempt to read volunteers from a likely table; fall back to profiles-like table names.
//   async getVolunteers() {
//     // Try a few candidate tables/columns to be tolerant to team differences
//     const candidates = [
//       {
//         table: 'volunteers',
//         select:
//           'id, name, email, location, skills, availability'
//       },
//       {
//         table: 'profiles',
//         select:
//           'id, fullName as name, email, CONCAT_WS(", ", city, state) as location, skills, availability'
//       },
//       {
//         table: 'users',
//         select:
//           'id, name, email, city, state, skills, availability'
//       }
//     ];

//     for (const c of candidates) {
//       try {
//         const [rows] = await db.promise().query(`SELECT ${c.select} FROM ${c.table}`);
//         if (rows && rows.length >= 0) {
//           return rows.map((v) => {
//             const location =
//               v.location ??
//               (v.city && v.state ? `${v.city}, ${v.state}` : 'Unknown');
//             return {
//               id: v.id,
//               name: v.name ?? v.fullName ?? v.email ?? `Volunteer #${v.id}`,
//               email: v.email ?? null,
//               location,
//               skills: safeJSON(v.skills, []),
//               availability: safeJSON(v.availability, [])
//             };
//           });
//         }
//       } catch (err) {
//         // Try next candidate
//       }
//     }
//     // Nothing worked
//     return [];
//   }

//   async getEvents() {
//     // Minimal event set – name/title, location, date, skills
//     const queries = [
//       {
//         table: 'events',
//         select:
//           'id, name, title, location, date, requiredSkills, skills, urgency'
//       }
//     ];
//     for (const q of queries) {
//       try {
//         const [rows] = await db.promise().query(`SELECT ${q.select} FROM ${q.table}`);
//         if (rows) {
//           return rows.map((e) => ({
//             id: e.id,
//             name: pickName(e),
//             location: e.location ?? 'TBD',
//             date: e.date ?? null,
//             requiredSkills: pickSkills(e),
//             urgency: e.urgency ?? 'Low'
//           }));
//         }
//       } catch (err) {
//         // Try next
//       }
//     }
//     return [];
//   }

//   async getEventById(eventId) {
//     const [rows] = await db
//       .promise()
//       .query(
//         'SELECT id, name, title, location, date, requiredSkills, skills, urgency FROM events WHERE id = ?',
//         [eventId]
//       );
//     if (!rows || rows.length === 0) return null;
//     const row = rows[0];
//     return {
//       id: row.id,
//       name: pickName(row),
//       location: row.location ?? 'TBD',
//       date: row.date ?? null,
//       requiredSkills: pickSkills(row),
//       urgency: row.urgency ?? 'Low'
//     };
//   }

//   calculateMatchScore(volunteer, event) {
//     // Weights: skills 50%, location 30%, availability 20%
//     const req = event.requiredSkills || [];
//     const have = volunteer.skills || [];

//     const skillsHit = have.filter((s) => req.includes(s)).length;
//     const skillsMatch = req.length ? skillsHit / req.length : 0;

//     const volCity = (volunteer.location || '').split(',')[0].trim();
//     const evtCity = (event.location || '').split(',')[0].trim();
//     const locationMatch = volCity && evtCity ? (volCity === evtCity ? 1 : 0.3) : 0;

//     const availabilityMatch = (volunteer.availability || []).includes(event.date) ? 1 : 0;

//     const score = skillsMatch * 0.5 + locationMatch * 0.3 + availabilityMatch * 0.2;
//     return Math.round(score * 100) / 100;
//   }

//   generateReason(volunteer, event, matchingSkills) {
//     const reasons = [];
//     if (matchingSkills.length) reasons.push(`Skill match: ${matchingSkills.join(', ')}`);
//     const volCity = (volunteer.location || '').split(',')[0].trim();
//     const evtCity = (event.location || '').split(',')[0].trim();
//     if (volCity && evtCity && volCity === evtCity) reasons.push('Same city');
//     if ((volunteer.availability || []).includes(event.date)) reasons.push('Available on date');
//     return reasons.join('; ') || 'Low match score';
//   }

//   async findVolunteerMatches(eventId) {
//     const event = await this.getEventById(eventId);
//     if (!event) throw new Error('Event not found');

//     const volunteers = await this.getVolunteers();
//     const matches = volunteers.map((v) => {
//       const score = this.calculateMatchScore(v, event);
//       const matchingSkills = (v.skills || []).filter((s) => (event.requiredSkills || []).includes(s));
//       return {
//         volunteer: {
//           id: v.id,
//           name: v.name,
//           email: v.email,
//           location: v.location,
//           availability: v.availability,
//           skills: v.skills
//         },
//         event,
//         matchScore: score,
//         matchingSkills,
//         isAvailable: (v.availability || []).includes(event.date),
//         reason: this.generateReason(v, event, matchingSkills)
//       };
//     });

//     return matches
//       .filter((m) => m.matchScore > 0.3)
//       .sort((a, b) => b.matchScore - a.matchScore);
//   }

//   async createVolunteerMatch(volunteerId, eventId) {
//     // Load entities
//     const [volCandidates] = await db
//       .promise()
//       .query(
//         // try volunteers first, fallback to profiles
//         `SELECT id, name, email, location, skills, availability FROM volunteers WHERE id = ?
//          UNION
//          SELECT id, fullName as name, email, CONCAT_WS(", ", city, state) as location, skills, availability FROM profiles WHERE id = ?`,
//         [volunteerId, volunteerId]
//       );

//     if (!volCandidates || volCandidates.length === 0) {
//       throw new Error('Volunteer not found');
//     }
//     const v = volCandidates[0];
//     const volunteer = {
//       id: v.id,
//       name: v.name ?? v.email ?? `Volunteer #${v.id}`,
//       location: v.location ?? 'Unknown',
//       skills: safeJSON(v.skills, []),
//       availability: safeJSON(v.availability, [])
//     };

//     const event = await this.getEventById(eventId);
//     if (!event) throw new Error('Event not found');

//     const matchScore = this.calculateMatchScore(volunteer, event);

//     // Ensure table exists; if not, try to create quickly (one-time safety)
//     await db
//       .promise()
//       .query(
//         `CREATE TABLE IF NOT EXISTS volunteer_matches (
//            id INT AUTO_INCREMENT PRIMARY KEY,
//            volunteerId INT NOT NULL,
//            eventId INT NOT NULL,
//            volunteerName VARCHAR(100) NOT NULL,
//            eventName VARCHAR(100) NOT NULL,
//            matchScore DECIMAL(5,2) NOT NULL,
//            matchDate DATETIME NOT NULL,
//            status VARCHAR(30) DEFAULT 'matched',
//            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//          )`
//       );

//     const [ins] = await db
//       .promise()
//       .query(
//         `INSERT INTO volunteer_matches
//          (volunteerId, eventId, volunteerName, eventName, matchScore, matchDate, status)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           volunteerId,
//           eventId,
//           volunteer.name,
//           event.name,
//           matchScore,
//           new Date(),
//           'matched'
//         ]
//       );

//     // Also append to volunteer_history for cohesion
//     await db
//       .promise()
//       .query(
//         `CREATE TABLE IF NOT EXISTS volunteer_history (
//            id INT AUTO_INCREMENT PRIMARY KEY,
//            volunteerId INT NOT NULL,
//            volunteerName VARCHAR(100) NOT NULL,
//            eventId INT NOT NULL,
//            eventName VARCHAR(100) NOT NULL,
//            eventDate DATE NOT NULL,
//            eventLocation VARCHAR(255) NOT NULL,
//            participationStatus ENUM('registered','in-progress','completed','cancelled') DEFAULT 'registered',
//            hoursVolunteered INT DEFAULT 0,
//            skillsUsed JSON DEFAULT NULL,
//            feedback TEXT,
//            rating INT DEFAULT 0,
//            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//          )`
//       );

//     await db
//       .promise()
//       .query(
//         `INSERT INTO volunteer_history
//          (volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           volunteerId,
//           volunteer.name,
//           eventId,
//           event.name,
//           event.date ?? new Date(),
//           event.location ?? 'TBD',
//           'registered',
//           0,
//           JSON.stringify([]),
//           '',
//           0
//         ]
//       );

//     return {
//       success: true,
//       data: {
//         matchId: ins.insertId,
//         volunteerId: Number(volunteerId),
//         eventId: Number(eventId),
//         volunteerName: volunteer.name,
//         eventName: event.name,
//         matchScore,
//         status: 'matched'
//       }
//     };
//   }
// }

// module.exports = new VolunteerMatchingService();

// class VolunteerMatchingService {
//     volunteers = [
//         {
//             id: 1,
//             name: "John Doe",
//             skills: ["teaching", "mentoring", "first-aid"],
//             location: "New York, NY",
//             availability: ["2024-01-15", "2024-01-20", "2024-01-25"]
//         },
//         {
//             id: 2, 
//             name: "Jane Smith",
//             skills: ["cooking", "organizing", "driving"],
//             location: "Jersey City, NJ", 
//             availability: ["2024-01-10", "2024-01-15", "2024-01-30"]
//         },
//         {
//             id: 3,
//             name: "Mike Johnson",
//             skills: ["construction", "heavy-lifting"],
//             location: "New York, NY",
//             availability: ["2024-01-25", "2024-02-01"]
//         }
//     ];

//     events = [
//         {
//             id: 1,
//             name: "Community Food Drive",
//             requiredSkills: ["cooking", "organizing"],
//             location: "New York, NY",
//             date: "2024-01-15",
//             urgency: "high"
//         },
//         {
//             id: 2,
//             name: "Youth Mentorship Program", 
//             requiredSkills: ["teaching", "mentoring"],
//             location: "Brooklyn, NY",
//             date: "2024-01-20",
//             urgency: "normal"
//         },
//         {
//             id: 3,
//             name: "Shelter Construction",
//             requiredSkills: ["construction", "heavy-lifting"],
//             location: "Queens, NY", 
//             date: "2024-01-25",
//             urgency: "urgent"
//         }
//     ];

//     async findVolunteerMatches(eventId) {
//         const event = this.events.find(e => e.id === parseInt(eventId));
//         if (!event) {
//             throw new Error("Event not found");
//         }

//         const matches = this.volunteers.map(volunteer => {
//             const matchScore = this.calculateMatchScore(volunteer, event);
//             const matchingSkills = volunteer.skills.filter(skill => 
//                 event.requiredSkills.includes(skill)
//             );
            
//             return {
//                 volunteer: {
//                     id: volunteer.id,
//                     name: volunteer.name,
//                     skills: volunteer.skills,
//                     location: volunteer.location,
//                     availability: volunteer.availability
//                 },
//                 matchScore: matchScore,
//                 matchingSkills: matchingSkills,
//                 isAvailable: volunteer.availability.includes(event.date),
//                 reason: this.generateMatchReason(volunteer, event, matchingSkills, matchScore)
//             };
//         });

//         return matches
//             .filter(match => match.matchScore > 0.3)
//             .sort((a, b) => b.matchScore - a.matchScore);
//     }

//     calculateMatchScore(volunteer, event) {
//         // Skills matching (50% weight)
//         const skillsMatch = volunteer.skills.filter(skill => 
//             event.requiredSkills.includes(skill)
//         ).length / event.requiredSkills.length;

//         // Location matching (30% weight)
//         const volCity = volunteer.location.split(',')[0].trim();
//         const eventCity = event.location.split(',')[0].trim();
//         const locationMatch = volCity === eventCity ? 1 : 0.3;

//         // Availability matching (20% weight)
//         const availabilityMatch = volunteer.availability.includes(event.date) ? 1 : 0;

//         const totalScore = (skillsMatch * 0.5) + (locationMatch * 0.3) + (availabilityMatch * 0.2);
//         return Math.round(totalScore * 100) / 100;
//     }

//     generateMatchReason(volunteer, event, matchingSkills, matchScore) {
//         const reasons = [];
        
//         if (matchingSkills.length > 0) {
//             reasons.push(`Matches ${matchingSkills.length} required skills: ${matchingSkills.join(', ')}`);
//         }
        
//         if (volunteer.availability.includes(event.date)) {
//             reasons.push("Available on event date");
//         }
        
//         const volCity = volunteer.location.split(',')[0].trim();
//         const eventCity = event.location.split(',')[0].trim();
//         if (volCity === eventCity) {
//             reasons.push("Same city location");
//         }
        
//         return reasons.length > 0 ? reasons.join('; ') : "Low match score";
//     }

//     async createVolunteerMatch(volunteerId, eventId) {
//         const volunteer = this.volunteers.find(v => v.id === parseInt(volunteerId));
//         const event = this.events.find(e => e.id === parseInt(eventId));
        
//         if (!volunteer || !event) {
//             throw new Error("Volunteer or event not found");
//         }

//         const matchScore = this.calculateMatchScore(volunteer, event);

//         return {
//             matchId: Date.now(),
//             volunteerId: parseInt(volunteerId),
//             eventId: parseInt(eventId),
//             volunteerName: volunteer.name,
//             eventName: event.name,
//             matchScore: matchScore,
//             matchDate: new Date().toISOString(),
//             status: "matched"
//         };
//     }
// }

// module.exports = new VolunteerMatchingService();