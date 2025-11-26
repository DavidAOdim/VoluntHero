// backend/src/modules/VolunteerMatching/service.js
const db = require("../../../../db");

function safeJson(value) {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return JSON.parse(value);
  } catch {
    return [];
  }
}

class VolunteerMatchingService {
  // ---- Load event ----
  async getEvent(eventId) {
    const [rows] = await db.query(
      "SELECT id, title, date, location, requiredSkills FROM events WHERE id = ?",
      [eventId]
    );

    if (!rows.length) {
      throw new Error("Event not found");
    }

    const ev = rows[0];

    return {
      id: ev.id,
      title: ev.title,
      date: ev.date, // JS Date from mysql2
      location: ev.location,
      requiredSkills: safeJson(ev.requiredSkills),
    };
  }

  // ---- Load all volunteers from UserProfile ----
  async getVolunteers() {
    const [rows] = await db.query(`
      SELECT email, fullName, skills, availability, city, state
      FROM UserProfile
    `);

    return rows.map((v) => ({
      email: v.email,
      fullName: v.fullName,
      skills: safeJson(v.skills),
      availability: safeJson(v.availability),
      city: v.city || "",
      state: v.state || "",
    }));
  }

  // ---- Matching algorithm ----
  async findMatches(eventId) {
    const event = await this.getEvent(eventId);
    const volunteers = await this.getVolunteers();

    const eventDateStr = event.date
      ? new Date(event.date).toISOString().slice(0, 10)
      : null;

    return volunteers
      .map((v) => {
        const required = event.requiredSkills || [];

        const matchingSkills = v.skills.filter((s) => required.includes(s));

        const eventCity = (event.location || "").split(",")[0].trim().toLowerCase();
        const volCity = (v.city || "").split(",")[0].trim().toLowerCase();
        const sameCity = eventCity && volCity && eventCity === volCity;

        const weekday = eventDateStr
          ? new Date(eventDateStr).toLocaleString("en-US", { weekday: "long" })
          : null;

        const available =
          (eventDateStr && v.availability.includes(eventDateStr)) ||
          (weekday && v.availability.includes(weekday));

        const score =
          (matchingSkills.length > 0 ? 50 : 0) +
          (sameCity ? 30 : 0) +
          (available ? 20 : 0);

        return {
          volunteerEmail: v.email,
          volunteerName: v.fullName,
          skills: v.skills,
          matchScore: score,
          reason: [
            matchingSkills.length ? `Skills: ${matchingSkills.join(", ")}` : "",
            sameCity ? "Same city" : "",
            available ? "Available on date" : "",
          ]
            .filter(Boolean)
            .join(" • "),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  // ---- Assign volunteer to event (insert into volunteer_history) ----
  async assignVolunteer(volunteerEmail, volunteerName, eventId) {
    const event = await this.getEvent(eventId);

    const eventDateStr = event.date
      ? new Date(event.date).toISOString().slice(0, 10)
      : null;

    const [result] = await db.query(
      `
      INSERT INTO volunteer_history
        (volunteerEmail, volunteerId, volunteerName, eventId, eventName,
         eventDate, eventLocation, participationStatus, hoursVolunteered,
         skillsUsed, feedback, rating)
      VALUES (?, NULL, ?, ?, ?, ?, ?, 'registered', 0, '[]', '', 0)
      `,
      [
        volunteerEmail,
        volunteerName,
        event.id,
        event.title,
        eventDateStr,
        event.location,
      ]
    );

    console.log("✅ Inserted volunteer_history id:", result.insertId);

    return result.insertId;
  }

  // ---- Get already assigned volunteers for an event ----
  async getAssigned(eventId) {
    const [rows] = await db.query(
      `
      SELECT id, volunteerEmail, volunteerName, eventName, eventDate
      FROM volunteer_history
      WHERE eventId = ?
      ORDER BY createdAt DESC
      `,
      [eventId]
    );

    return rows;
  }
}

module.exports = new VolunteerMatchingService();


// // backend/src/modules/VolunteerMatching/service.js
// const db = require("../../../../db");

// // JSON parser helper
// const safe = (v) => {
//   try {
//     return Array.isArray(v) ? v : JSON.parse(v || "[]");
//   } catch {
//     return [];
//   }
// };

// class VolunteerMatchingService {
//   // LOAD EVENT FROM DATABASE
//   async getEvent(eventId) {
//     const [rows] = await db.query(
//       "SELECT * FROM events WHERE id = ?",
//       [eventId]
//     );

//     if (!rows.length) throw new Error("Event not found");

//     return {
//       id: rows[0].id,
//       title: rows[0].title,
//       date: rows[0].date,
//       location: rows[0].location,
//       requiredSkills: safe(rows[0].requiredSkills),
//     };
//   }

//   // LOAD VOLUNTEERS FROM USERPROFILE
//   async getVolunteers() {
//     const [rows] = await db.query(`
//       SELECT email, fullName, skills, availability, city, state
//       FROM UserProfile
//     `);

//     return rows.map((v) => ({
//       email: v.email,
//       fullName: v.fullName,
//       skills: safe(v.skills),
//       availability: safe(v.availability),
//       city: v.city,
//       state: v.state,
//     }));
//   }

//   // MATCHING ALGORITHM
//   async findMatches(eventId) {
//     const event = await this.getEvent(eventId);
//     const volunteers = await this.getVolunteers();

//     const eventDate = event.date.toISOString().slice(0, 10);

//     return volunteers.map((v) => {
//       const skillMatches = v.skills.filter((s) =>
//         event.requiredSkills.includes(s)
//       );

//       const sameCity = (v.city || "").split(",")[0].trim().toLowerCase() ===
//                        (event.location || "").split(",")[0].trim().toLowerCase();

//       const available =
//         v.availability.includes(eventDate) ||
//         v.availability.includes(
//           new Date(eventDate).toLocaleString("en-US", { weekday: "long" })
//         );

//       const score =
//         skillMatches.length * 50 +
//         (sameCity ? 30 : 0) +
//         (available ? 20 : 0);

//       return {
//         volunteerEmail: v.email,
//         volunteerName: v.fullName,
//         skills: v.skills,
//         matchScore: score,
//         reason: [
//           skillMatches.length ? `Skills: ${skillMatches.join(", ")}` : "",
//           sameCity ? "Same city" : "",
//           available ? "Available on date" : "",
//         ].filter(Boolean).join(" • "),
//       };
//     }).sort((a, b) => b.matchScore - a.matchScore);
//   }

//   // ASSIGN VOLUNTEER
//   async assignVolunteer(volunteerEmail, volunteerName, eventId) {
//     const event = await this.getEvent(eventId);

//     const eventDate = event.date.toISOString().slice(0, 10);

//     const [result] = await db.query(
//       `
//       INSERT INTO volunteer_history
//       (volunteerEmail, volunteerId, volunteerName, eventId, eventName, eventDate, eventLocation,
//        participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//       VALUES (?, NULL, ?, ?, ?, ?, ?, 'registered', 0, '[]', '', 0)
//       `,
//       [
//         volunteerEmail,
//         volunteerName,
//         event.id,
//         event.title,
//         eventDate,
//         event.location,
//       ]
//     );

//     return result.insertId;
//   }

//   async getAssigned(eventId) {
//     const [rows] = await db.query(
//       `SELECT * FROM volunteer_history WHERE eventId = ? ORDER BY createdAt DESC`,
//       [eventId]
//     );
//     return rows;
//   }
// }

// module.exports = new VolunteerMatchingService();


// // backend/src/modules/VolunteerMatching/service.js

// const db = require("../../../../db");

// function safeParse(value) {
//   try {
//     if (!value) return [];
//     if (Array.isArray(value)) return value;
//     return JSON.parse(value);
//   } catch {
//     return [];
//   }
// }

// class VolunteerMatchingService {
//   // ---------- LOAD EVENT ----------
//   async getEvent(eventId) {
//     const [rows] = await db.query(
//       `SELECT id, title, date, location, requiredSkills 
//        FROM events 
//        WHERE id = ?`,
//       [eventId]
//     );

//     if (!rows.length) throw new Error("Event not found");

//     const e = rows[0];

//     return {
//       id: e.id,
//       title: e.title,
//       date: e.date,
//       location: e.location,
//       requiredSkills: safeParse(e.requiredSkills),
//     };
//   }

//   // ---------- LOAD VOLUNTEERS FROM USERPROFILE ----------
//   async getVolunteers() {
//     const [rows] = await db.query(
//       `SELECT id, email, fullName, city, state, skills, availability
//        FROM UserProfile`
//     );

//     return rows.map((v) => ({
//       userId: v.id, // primary key in UserProfile
//       email: v.email,
//       fullName: v.fullName,
//       skills: safeParse(v.skills),
//       availability: safeParse(v.availability),
//       city: (v.city || "").split(",")[0].trim(),
//       state: v.state || "",
//     }));
//   }

//   normalizeDate(date) {
//     return new Date(date).toISOString().slice(0, 10);
//   }

//   // ---------- SCORING ----------
//   scoreVolunteer(vol, event) {
//     const reasons = [];
//     let score = 0;

//     // Skills
//     const matchingSkills = (event.requiredSkills || []).filter((skill) =>
//       vol.skills.includes(skill)
//     );
//     if (matchingSkills.length) {
//       score += matchingSkills.length * 50;
//       reasons.push(`Skills: ${matchingSkills.join(", ")}`);
//     }

//     // Location (city match)
//     const eventCity = (event.location || "").split(",")[0].trim();
//     if (vol.city && eventCity && vol.city.toLowerCase() === eventCity.toLowerCase()) {
//       score += 30;
//       reasons.push("Same city");
//     }

//     // Availability
//     const eventDate = this.normalizeDate(event.date);
//     if (vol.availability.includes(eventDate)) {
//       score += 50;
//       reasons.push("Available on date");
//     }

//     return {
//       score,
//       matchingSkills,
//       reason: reasons.length ? reasons.join(" • ") : "Low match score",
//     };
//   }

//   // ---------- FIND MATCHES ----------
//   async findMatches(eventId) {
//     const event = await this.getEvent(eventId);
//     const volunteers = await this.getVolunteers();

//     const matches = volunteers.map((vol) => {
//       const { score, matchingSkills, reason } = this.scoreVolunteer(vol, event);

//       return {
//         userId: vol.userId,
//         email: vol.email,
//         fullName: vol.fullName,
//         skills: vol.skills,
//         matchingSkills,
//         matchScore: score, // already in %
//         reason,
//       };
//     });

//     return matches.sort((a, b) => b.matchScore - a.matchScore);
//   }

//   // ---------- ASSIGN VOLUNTEER ----------
//   // IMPORTANT: this matches your *existing* volunteer_history schema:
//   // (volunteerEmail, volunteerName, eventId, eventName, eventDate, eventLocation,
//   //  participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//   async assignVolunteer(volunteerId, eventId) {
//     // Load volunteer from UserProfile
//     const [volRows] = await db.query(
//       `SELECT email, fullName 
//        FROM UserProfile 
//        WHERE id = ?`,
//       [volunteerId]
//     );

//     if (!volRows.length) {
//       throw new Error("Volunteer not found");
//     }

//     const volunteer = volRows[0];

//     // Load event
//     const [eventRows] = await db.query(
//       `SELECT id, title, date, location 
//        FROM events 
//        WHERE id = ?`,
//       [eventId]
//     );

//     if (!eventRows.length) {
//       throw new Error("Event not found");
//     }

//     const event = eventRows[0];

//     const eventDate = this.normalizeDate(event.date);

//     // Insert into volunteer_history (using volunteerEmail, not volunteerId)
//     const [result] = await db.query(
//       `
//       INSERT INTO volunteer_history
//       (volunteerEmail, volunteerName, eventId, eventName, eventDate, eventLocation,
//        participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//       VALUES (?, ?, ?, ?, ?, ?, 'assigned', 0, '[]', '', 0)
//       `,
//       [
//         volunteer.email,
//         volunteer.fullName,
//         event.id,
//         event.title,
//         eventDate,
//         event.location,
//       ]
//     );

//     return { insertId: result.insertId };
//   }
// }

// module.exports = new VolunteerMatchingService();


// const db = require("../../../../db");

// // Parse JSON safely
// const safe = (v) => {
//   try {
//     if (!v) return [];
//     if (Array.isArray(v)) return v;
//     return JSON.parse(v);
//   } catch {
//     return [];
//   }
// };

// class VolunteerMatchingService {
//   // -------------------------
//   // LOAD EVENT
//   // -------------------------
//   async getEvent(eventId) {
//     const [rows] = await db.query(
//       `SELECT id, title, location, date, requiredSkills FROM events WHERE id = ?`,
//       [eventId]
//     );

//     if (!rows.length) throw new Error("Event not found");

//     const e = rows[0];

//     return {
//       id: e.id,
//       title: e.title,
//       location: e.location,
//       date: e.date,
//       requiredSkills: safe(e.requiredSkills),
//     };
//   }

//   // -------------------------
//   // LOAD VOLUNTEERS FROM UserProfile
//   // -------------------------
//   async getVolunteers() {
//     const [rows] = await db.query(
//       `
//       SELECT email, fullName, city, state, skills, availability
//       FROM UserProfile
//     `
//     );

//     return rows.map((v) => ({
//       email: v.email,
//       fullName: v.fullName || v.email,
//       location: `${v.city}, ${v.state}`,
//       skills: safe(v.skills),
//       availability: safe(v.availability),
//     }));
//   }

//   // -------------------------
//   // FIND MATCHES
//   // -------------------------
//   async findMatches(eventId) {
//     const event = await this.getEvent(eventId);
//     const volunteers = await this.getVolunteers();

//     const eventCity = event.location.split(",")[0].trim().toLowerCase();
//     const eventDate = new Date(event.date).toISOString().slice(0, 10);

//     const results = volunteers.map((v) => {
//       const volCity = v.location.split(",")[0].trim().toLowerCase();

//       const skillMatches = v.skills.filter((s) =>
//         event.requiredSkills.includes(s)
//       );

//       const isAvailable =
//         v.availability.includes(eventDate) ||
//         v.availability.includes(event.date) ||
//         v.availability.includes("Monday") || // weekday fallback
//         v.availability.includes("Friday");

//       const score =
//         skillMatches.length * 50 +
//         (volCity === eventCity ? 30 : 0) +
//         (isAvailable ? 20 : 0);

//       return {
//         email: v.email,
//         fullName: v.fullName,
//         skills: v.skills,
//         matchScore: score,
//         reason: [
//           skillMatches.length ? `Skills: ${skillMatches.join(", ")}` : null,
//           volCity === eventCity ? "Same city" : null,
//           isAvailable ? "Available on date" : null,
//         ]
//           .filter(Boolean)
//           .join(" • "),
//       };
//     });

//     return results.sort((a, b) => b.matchScore - a.matchScore);
//   }

//   // -------------------------
//   // ASSIGN VOLUNTEER
//   // -------------------------
//   async assignVolunteer(volunteerEmail, eventId) {
//     const event = await this.getEvent(eventId);

//     const [user] = await db.query(
//       `SELECT fullName FROM UserProfile WHERE email = ?`,
//       [volunteerEmail]
//     );

//     const volunteerName = user[0]?.fullName || volunteerEmail;

//     const eventDate = new Date(event.date).toISOString().slice(0, 10);

//     const [result] = await db.query(
//       `
//       INSERT INTO volunteer_history
//       (volunteerId, volunteerName, volunteerEmail, eventId, eventName, eventDate, eventLocation, participationStatus, hoursVolunteered)
//       VALUES (?, ?, ?, ?, ?, ?, ?, 'registered', 0)
//       `,
//       [
//         volunteerEmail,
//         volunteerName,
//         volunteerEmail,
//         event.id,
//         event.title,
//         eventDate,
//         event.location,
//       ]
//     );

//     return result.insertId;
//   }
// }

// module.exports = new VolunteerMatchingService();




// // backend/src/modules/VolunteerMatching/service.js

// const db = require("../../../../db");

// class VolunteerMatchingService {

//   /* ----------------------------------------------------
//      Safe JSON Parse - NEVER throws
//   ---------------------------------------------------- */
//   parseJSON(value) {
//     if (!value) return [];
//     if (Array.isArray(value)) return value;

//     try {
//       return JSON.parse(value);
//     } catch (err) {
//       console.warn("⚠️ Bad JSON encountered, cleaning:", value);
//       return [];
//     }
//   }

//   normalizeDate(dateObj) {
//     if (!dateObj) return null;
//     try {
//       return new Date(dateObj).toISOString().slice(0, 10);
//     } catch {
//       return null;
//     }
//   }

//   /* ----------------------------------------------------
//      Load Event From DB
//   ---------------------------------------------------- */
//   async getEvent(eventId) {
//     const [rows] = await db.query(
//       "SELECT id, title, date, location, requiredSkills FROM events WHERE id = ?",
//       [eventId]
//     );

//     if (!rows.length) {
//       console.error("❌ Event not found in DB:", eventId);
//       throw new Error("Event not found");
//     }

//     const event = rows[0];

//     return {
//       id: event.id,
//       name: event.title,
//       date: this.normalizeDate(event.date),
//       location: event.location,
//       requiredSkills: this.parseJSON(event.requiredSkills)
//     };
//   }

//   /* ----------------------------------------------------
//      Load Volunteers From DB
//   ---------------------------------------------------- */
//   async getVolunteers() {
//     const [rows] = await db.query(
//       "SELECT id, name, email, location, skills, availability FROM volunteers"
//     );

//     console.log("🔍 Loaded volunteers:", rows.map(v => v.email));

//     return rows.map(v => ({
//       id: v.id,
//       name: v.name,
//       email: v.email,
//       location: v.location,
//       skills: this.parseJSON(v.skills),
//       availability: this.parseJSON(v.availability)
//     }));
//   }

//   /* ----------------------------------------------------
//      Match Scoring
//   ---------------------------------------------------- */
//   calculateMatch(vol, event) {
//     if (!event.requiredSkills.length) return 0;

//     const skillMatches = vol.skills.filter(s =>
//       event.requiredSkills.includes(s)
//     );

//     const skillScore = skillMatches.length / event.requiredSkills.length;

//     const sameCity =
//       vol.location.split(",")[0].trim().toLowerCase() ===
//       event.location.split(",")[0].trim().toLowerCase();

//     const cityScore = sameCity ? 1 : 0;

//     const available = vol.availability.includes(event.date);
//     const availScore = available ? 1 : 0;

//     const total =
//       skillScore * 0.5 +
//       cityScore * 0.3 +
//       availScore * 0.2;

//     return {
//       score: Math.round(total * 100) / 100,
//       skillMatches,
//       sameCity,
//       available
//     };
//   }

//   /* ----------------------------------------------------
//      FIND MATCHES
//   ---------------------------------------------------- */
//   async findVolunteerMatches(eventId) {
//     console.log("🔎 Matching volunteers for event:", eventId);

//     let event;
//     try {
//       event = await this.getEvent(eventId);
//     } catch (err) {
//       return [];
//     }

//     const volunteers = await this.getVolunteers();

//     const matches = volunteers
//       .map(v => {
//         const result = this.calculateMatch(v, event);

//         return {
//           volunteer: v,
//           matchScore: result.score,
//           matchingSkills: result.skillMatches,
//           isAvailable: result.available,
//           reason: [
//             result.skillMatches.length
//               ? `Skills matched: ${result.skillMatches.join(", ")}`
//               : "No required skills",
//             result.sameCity ? "Same city" : "Different city",
//             result.available ? "Available" : "Not available"
//           ].join(" • ")
//         };
//       })
//       .filter(m => m.matchScore > 0);

//     console.log(`📊 Found ${matches.length} matches`);

//     return matches.sort((a, b) => b.matchScore - a.matchScore);
//   }

//   /* ----------------------------------------------------
//      CREATE HISTORY ENTRY
//   ---------------------------------------------------- */
//   async createVolunteerMatch(volunteerId, eventId) {
//     const [eventRows] = await db.query("SELECT date, location FROM events WHERE id = ?", [eventId]);

//     if (!eventRows.length) throw new Error("Event not found");

//     const event = eventRows[0];

//     const eventDate = this.normalizeDate(event.date);

//     const [result] = await db.query(
//       `INSERT INTO volunteer_history
//       (volunteerId, eventId, participationStatus, hoursVolunteered, eventDate, eventLocation)
//       VALUES (?, ?, 'registered', 0, ?, ?)`,
//       [volunteerId, eventId, eventDate, event.location]
//     );

//     return { id: result.insertId };
//   }
// }

// module.exports = new VolunteerMatchingService();

// // backend/src/modules/VolunteerMatching/service.js
// const db = require("../../../../db");

// class VolunteerMatchingService {
//   // ========== LOAD EVENT ==========
//   async getEvent(eventId) {
//     const [[event]] = await db.query(
//       `SELECT id, title, date, location, requiredSkills FROM events WHERE id = ?`,
//       [eventId]
//     );

//     if (!event) throw new Error("Event not found");

//     return {
//       id: event.id,
//       name: event.title,
//       date: event.date,
//       location: event.location,
//       //requiredSkills: event.requiredSkills ? JSON.parse(event.requiredSkills) : [],
//       requiredSkills: (() => {
//         try {
//             return JSON.parse(event.requiredSkills || "[]");
//         } catch {
//             return [];
//         }
//         })(),
//     };
//   }

//   // ========== LOAD VOLUNTEERS (REAL USERS) ==========
//   async getVolunteers() {
//     const [rows] = await db.query(`
//       SELECT 
//         u.email,
//         p.fullName,
//         CONCAT(p.city, ', ', p.state) AS location,
//         p.skills,
//         p.availability
//       FROM UserCredentials u
//       INNER JOIN UserProfile p ON u.email = p.email
//       WHERE u.role = 'volunteer'
//     `);

//     if (rows.length === 0) {
//       console.warn("⚠️ No volunteers found in UserProfile + UserCredentials.");
//     } else {
//       console.log("✅ Loaded volunteers:", rows.map((r) => r.email));
//     }

//     return rows.map((v) => ({
//       email: v.email,
//       name: v.fullName,
//       location: v.location,
//       skills: JSON.parse(v.skills || "[]"),
//       availability: JSON.parse(v.availability || "[]"),
//     }));
//   }

//   normalizeDate(date) {
//     return new Date(date).toISOString().split("T")[0];
//   }

//   // ========== FIND MATCHES ==========
//   async findMatches(eventId) {
//     const event = await this.getEvent(eventId);
//     const volunteers = await this.getVolunteers();

//     const eventDate = this.normalizeDate(event.date);

//     const matches = volunteers.map((v) => {
//       const sharedSkills = event.requiredSkills.filter((skill) => v.skills.includes(skill));

//       const skillScore = event.requiredSkills.length
//         ? sharedSkills.length / event.requiredSkills.length
//         : 0;
//       const locScore =
//         v.location.split(",")[0].trim().toLowerCase() ===
//         event.location.split(",")[0].trim().toLowerCase()
//           ? 1
//           : 0;
//       const dateScore = v.availability.includes(eventDate) ? 1 : 0;

//       const matchPercent = Math.round(
//         (skillScore * 0.6 + locScore * 0.3 + dateScore * 0.1) * 100
//       );

//       return {
//         volunteer: v,
//         matchPercent,
//         reason: [
//           sharedSkills.length ? `Matches skills: ${sharedSkills.join(", ")}` : null,
//           locScore ? "Same city" : null,
//           dateScore ? "Available on event date" : null,
//         ]
//           .filter(Boolean)
//           .join(" • "),
//       };
//     });

//     return matches
//       .filter((m) => m.matchPercent > 20)
//       .sort((a, b) => b.matchPercent - a.matchPercent);
//   }

//   // ========== ASSIGN VOLUNTEER ==========
//   async assignVolunteer(email, eventId) {
//     const [[profile]] = await db.query(
//       `SELECT fullName FROM UserProfile WHERE email = ?`,
//       [email]
//     );

//     const [[event]] = await db.query(
//       `SELECT title, date, location FROM events WHERE id = ?`,
//       [eventId]
//     );

//     if (!profile || !event) throw new Error("Invalid volunteer or event");

//     await db.query(
//       `
//       INSERT INTO volunteer_history
//       (volunteerEmail, volunteerName, eventId, eventName, eventDate, eventLocation,
//        participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//       VALUES (?, ?, ?, ?, ?, ?, 'assigned', 0, '[]', '', 0)
//     `,
//       [email, profile.fullName, eventId, event.title, event.date, event.location]
//     );

//     console.log(`✅ Assigned ${profile.fullName} (${email}) to ${event.title}`);
//     return { success: true, message: "Volunteer assigned successfully" };
//   }

//   // Optional: View assigned volunteers for event
//   async getAssigned(eventId) {
//     const [rows] = await db.query(
//       `SELECT * FROM volunteer_history WHERE eventId = ? ORDER BY createdAt DESC`,
//       [eventId]
//     );

//     return rows.map((r) => ({
//       ...r,
//       skillsUsed: JSON.parse(r.skillsUsed || "[]"),
//     }));
//   }
// }

// module.exports = new VolunteerMatchingService();

// const db = require("../../../../db");

// class VolunteerMatchingService {
//   // ========== LOAD EVENT ==========
//   async getEvent(eventId) {
//     const [[row]] = await db.query(
//       `SELECT id, title, date, location, requiredSkills FROM events WHERE id = ?`,
//       [eventId]
//     );
//     if (!row) throw new Error("Event not found");

//     return {
//       id: row.id,
//       name: row.title,
//       date: row.date,
//       location: row.location,
//       requiredSkills: row.requiredSkills ? JSON.parse(row.requiredSkills) : [],
//     };
//   }

//   // ========== LOAD REAL VOLUNTEERS ==========
//   async getVolunteers() {
//     const [rows] = await db.query(`
//       SELECT 
//         u.email,
//         p.fullName,
//         CONCAT(p.city, ', ', p.state) AS location,
//         p.skills,
//         p.availability
//       FROM UserCredentials u
//       JOIN UserProfile p ON u.email = p.email
//       WHERE u.role = 'volunteer'
//     `);

//     return rows.map((v) => ({
//       email: v.email,
//       name: v.fullName,
//       location: v.location,
//       skills: JSON.parse(v.skills || "[]"),
//       availability: JSON.parse(v.availability || "[]"),
//     }));
//   }

//   normalizeDate(dateObj) {
//     return new Date(dateObj).toISOString().slice(0, 10);
//   }

//   // ========== FIND MATCHES ==========
//   async findMatches(eventId) {
//     const event = await this.getEvent(eventId);
//     const volunteers = await this.getVolunteers();
//     const eventDate = this.normalizeDate(event.date);

//     const matches = volunteers.map((vol) => {
//       const matchedSkills = vol.skills.filter((s) =>
//         event.requiredSkills.includes(s)
//       );
//       const skillScore = event.requiredSkills.length
//         ? matchedSkills.length / event.requiredSkills.length
//         : 0;
//       const locScore =
//         vol.location.split(",")[0].trim() ===
//         event.location.split(",")[0].trim()
//           ? 1
//           : 0;
//       const availScore = vol.availability.includes(eventDate) ? 1 : 0;

//       const totalScore = skillScore * 0.5 + locScore * 0.3 + availScore * 0.2;

//       return {
//         volunteer: vol,
//         matchPercent: Math.round(totalScore * 100),
//         reason: [
//           matchedSkills.length ? `Matches skills: ${matchedSkills.join(", ")}` : null,
//           locScore ? "Same city" : null,
//           availScore ? "Available on date" : null,
//         ]
//           .filter(Boolean)
//           .join(" • "),
//       };
//     });

//     return matches
//       .filter((m) => m.matchPercent > 30)
//       .sort((a, b) => b.matchPercent - a.matchPercent);
//   }

//   // ========== ASSIGN VOLUNTEER ==========
//   async assignVolunteer(volunteerEmail, eventId) {
//     const [[profile]] = await db.query(
//       `SELECT fullName FROM UserProfile WHERE email = ?`,
//       [volunteerEmail]
//     );
//     const [[event]] = await db.query(
//       `SELECT title, date, location FROM events WHERE id = ?`,
//       [eventId]
//     );

//     if (!profile || !event) throw new Error("Invalid volunteer or event");

//     await db.query(
//       `
//       INSERT INTO volunteer_history
//       (volunteerEmail, volunteerName, eventId, eventName, eventDate, eventLocation,
//        participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//       VALUES (?, ?, ?, ?, ?, ?, 'assigned', 0, '[]', '', 0)
//     `,
//       [
//         volunteerEmail,
//         profile.fullName,
//         eventId,
//         event.title,
//         event.date,
//         event.location,
//       ]
//     );

//     return { success: true };
//   }

//   async getAssigned(eventId) {
//     const [rows] = await db.query(
//       `SELECT * FROM volunteer_history WHERE eventId = ?`,
//       [eventId]
//     );
//     return rows.map((r) => ({
//       ...r,
//       skillsUsed: JSON.parse(r.skillsUsed || "[]"),
//     }));
//   }
// }

// module.exports = new VolunteerMatchingService();

// const db = require("../../../../db");

// class VolunteerMatchingService {
//   // Get event details
//   async getEvent(eventId) {
//     const [[row]] = await db.query(`
//       SELECT id, title, date, location, requiredSkills
//       FROM events
//       WHERE id = ?
//     `, [eventId]);

//     if (!row) throw new Error("Event not found");

//     return {
//       id: row.id,
//       name: row.title,
//       date: row.date,
//       location: row.location,
//       requiredSkills: row.requiredSkills ? JSON.parse(row.requiredSkills) : []
//     };
//   }

//   // Get real volunteers from UserProfile
//   async getVolunteers() {
//     const [rows] = await db.query(`
//       SELECT 
//         u.email,
//         p.fullName,
//         CONCAT(p.city, ', ', p.state) AS location,
//         p.skills,
//         p.availability
//       FROM UserCredentials u
//       JOIN UserProfile p ON u.email = p.email
//       WHERE u.role = 'volunteer'
//     `);

//     return rows.map(v => ({
//       email: v.email,
//       name: v.fullName,
//       location: v.location,
//       skills: JSON.parse(v.skills || "[]"),
//       availability: JSON.parse(v.availability || "[]")
//     }));
//   }

//   normalizeDate(dateObj) {
//     return new Date(dateObj).toISOString().slice(0, 10);
//   }

//   // Find matches for an event
//   async findMatches(eventId) {
//     const event = await this.getEvent(eventId);
//     const volunteers = await this.getVolunteers();
//     const eventDate = this.normalizeDate(event.date);

//     const matches = volunteers.map(vol => {
//       const matchedSkills = vol.skills.filter(s => event.requiredSkills.includes(s));
//       const skillScore = event.requiredSkills.length
//         ? matchedSkills.length / event.requiredSkills.length
//         : 0;
//       const locScore = vol.location.split(",")[0].trim() === event.location.split(",")[0].trim() ? 1 : 0;
//       const availScore = vol.availability.includes(eventDate) ? 1 : 0;
//       const totalScore = skillScore * 0.5 + locScore * 0.3 + availScore * 0.2;

//       return {
//         volunteer: vol,
//         matchPercent: Math.round(totalScore * 100),
//         reason: [
//           matchedSkills.length ? `Matches skills: ${matchedSkills.join(", ")}` : null,
//           locScore ? "Same city" : null,
//           availScore ? "Available on date" : null
//         ].filter(Boolean).join(" • ")
//       };
//     });

//     return matches.filter(m => m.matchPercent > 30).sort((a, b) => b.matchPercent - a.matchPercent);
//   }

//   // Assign volunteer (using email)
//   async assignVolunteer(volunteerEmail, eventId) {
//     const [[profile]] = await db.query(
//       `SELECT fullName FROM UserProfile WHERE email = ?`, [volunteerEmail]
//     );

//     const [[event]] = await db.query(
//       `SELECT title, date, location FROM events WHERE id = ?`, [eventId]
//     );

//     if (!profile || !event) throw new Error("Invalid volunteer or event");

//     await db.query(`
//       INSERT INTO volunteer_history
//       (volunteerEmail, volunteerName, eventId, eventName, eventDate, eventLocation,
//        participationStatus, hoursVolunteered, skillsUsed, feedback, rating)
//       VALUES (?, ?, ?, ?, ?, ?, 'assigned', 0, '[]', '', 0)
//     `, [
//       volunteerEmail,
//       profile.fullName,
//       eventId,
//       event.title,
//       event.date,
//       event.location
//     ]);

//     return { success: true };
//   }

//   async getAssigned(eventId) {
//     const [rows] = await db.query(
//       `SELECT * FROM volunteer_history WHERE eventId = ?`,
//       [eventId]
//     );

//     return rows.map(r => ({
//       ...r,
//       skillsUsed: JSON.parse(r.skillsUsed || "[]")
//     }));
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