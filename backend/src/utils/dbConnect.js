// backend/src/utils/dbConnect.js
const path = require("path");

// ✅ Dynamically resolve db.js at project root (no matter where backend runs)
const db = require(path.resolve(__dirname, "../../../db.js"));

// Optional: simple connection test (can be removed in prod)
if (process.env.NODE_ENV !== "test") {
  db.getConnection((err, conn) => {
    if (err) {
      console.error("❌ DB connection failed (dbConnect.js):", err.message);
    } else {
      console.log("✅ DB connection verified (dbConnect.js)");
      conn.release();
    }
  });
}

module.exports = db;
