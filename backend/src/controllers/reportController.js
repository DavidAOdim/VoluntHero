// backend/src/controllers/reportController.js
const PDFDocument = require("pdfkit");
const { Parser } = require("json2csv");
const db = require("../../../db");

// ========================================
// SQL queries based on your REAL schema
// ========================================

// Volunteer report combines volunteers + volunteer_history + events
const VOLUNTEER_REPORT_SQL = `
  SELECT
    vh.id,
    vh.volunteerId,
    vh.volunteerName,
    vh.eventId,
    vh.eventName,
    vh.eventDate,
    vh.eventLocation,
    vh.participationStatus,
    vh.hoursVolunteered,
    vh.rating,
    vh.createdAt
  FROM volunteer_history vh
  ORDER BY vh.createdAt DESC;
`;

// Event report lists events + how many volunteers each event had
const EVENT_REPORT_SQL = `
  SELECT
    e.id AS eventId,
    e.title,
    e.date,
    e.location,
    e.description,
    COUNT(vh.id) AS volunteerCount
  FROM events e
  LEFT JOIN volunteer_history vh ON vh.eventId = e.id
  GROUP BY e.id, e.title, e.date, e.location, e.description
  ORDER BY e.date DESC;
`;

// ========================================
// JSON ENDPOINTS
// ========================================

exports.getVolunteerReport = async (req, res) => {
  try {
    const [rows] = await db.query(VOLUNTEER_REPORT_SQL);
    res.json(rows);
  } catch (err) {
    console.error("Volunteer Report Error:", err);
    res.status(500).json({ message: "Error generating volunteer report" });
  }
};

exports.getEventReport = async (req, res) => {
  try {
    const [rows] = await db.query(EVENT_REPORT_SQL);
    res.json(rows);
  } catch (err) {
    console.error("Event Report Error:", err);
    res.status(500).json({ message: "Error generating event report" });
  }
};

// ========================================
// CSV EXPORT
// ========================================

exports.getVolunteerCSV = async (req, res) => {
  try {
    const [rows] = await db.query(VOLUNTEER_REPORT_SQL);
    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("volunteer_report.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Volunteer CSV Error:", err);
    res.status(500).json({ message: "Error generating volunteer CSV" });
  }
};

exports.getEventCSV = async (req, res) => {
  try {
    const [rows] = await db.query(EVENT_REPORT_SQL);
    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("event_report.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Event CSV Error:", err);
    res.status(500).json({ message: "Error generating event CSV" });
  }
};

// ========================================
// PDF EXPORT
// ========================================

exports.getVolunteerPDF = async (req, res) => {
  try {
    const [rows] = await db.query(VOLUNTEER_REPORT_SQL);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=volunteer_report.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Volunteer Participation Report", { underline: true });
    doc.moveDown();

    rows.forEach((r) => {
      doc.fontSize(12).text(`Name: ${r.volunteerName} (ID: ${r.volunteerId})`);
      doc.text(`Event: ${r.eventName} (#${r.eventId})`);
      doc.text(`Date: ${r.eventDate} | Location: ${r.eventLocation}`);
      doc.text(`Hours: ${r.hoursVolunteered} | Status: ${r.participationStatus}`);
      doc.text(`Rating: ${r.rating}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("Volunteer PDF Error:", err);
    res.status(500).json({ message: "Error generating volunteer PDF" });
  }
};

exports.getEventPDF = async (req, res) => {
  try {
    const [rows] = await db.query(EVENT_REPORT_SQL);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=event_report.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Event Summary Report", { underline: true });
    doc.moveDown();

    rows.forEach((r) => {
      doc.fontSize(12).text(`Event: ${r.title} (#${r.eventId})`);
      doc.text(`Date: ${r.date} | Location: ${r.location}`);
      doc.text(`Volunteers: ${r.volunteerCount}`);
      doc.text(`Description: ${r.description}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("Event PDF Error:", err);
    res.status(500).json({ message: "Error generating event PDF" });
  }
};
