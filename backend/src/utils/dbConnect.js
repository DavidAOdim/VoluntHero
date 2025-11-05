// backend/src/utils/dbConnect.js
const mysql = require("mysql2");

// ✅ Create a MySQL2 connection pool (not a single connection)
const db = mysql.createPool({
  host: process.env.DB_HOST || "shuttle.proxy.rlwy.net",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "volunthero",
  port: process.env.DB_PORT || 44571,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Test the connection when server starts
db.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log(
      `✅ Database pool connected (${process.env.DB_NAME || "volunthero"})`
    );
    conn.release();
  }
});

module.exports = db;

// // backend/src/utils/dbConnect.js
// const path = require("path");

// // ✅ Dynamically resolve db.js at project root (no matter where backend runs)
// const db = require(path.resolve(__dirname, "../../../db.js"));

// // Optional: simple connection test (can be removed in prod)
// if (process.env.NODE_ENV !== "test") {
//   db.getConnection((err, conn) => {
//     if (err) {
//       console.error("❌ DB connection failed (dbConnect.js):", err.message);
//     } else {
//       console.log("✅ DB connection verified (dbConnect.js)");
//       conn.release();
//     }
//   });
// }

// module.exports = db;
