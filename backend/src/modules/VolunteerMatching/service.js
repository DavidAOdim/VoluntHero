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



