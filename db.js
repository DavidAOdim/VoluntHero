// db.js
/*const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();
module.exports = db;

// Test the database connection
if (process.env.NODE_ENV !== 'test') {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database:", err);
    } else {
      console.log("Database connection established successfully.");
      connection.release();
    }
  });
}
*/

// db.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();
module.exports = db;

// Test the database connection (outside test env)
if (process.env.NODE_ENV !== "test") {
  db.getConnection()
    .then((connection) => {
      console.log("Database connection established successfully.");
      connection.release();
    })
    .catch((err) => {
      console.error("Error connecting to the database:", err.code, err.sqlMessage);
    });
}
