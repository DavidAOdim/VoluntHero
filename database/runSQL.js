// database/runSQL.js
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function runSQLFile(filePath) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true,
    });

    const sql = fs.readFileSync(path.resolve(filePath), 'utf8');
    await connection.query(sql);
    console.log(`✅ Successfully executed: ${path.basename(filePath)}`);
    await connection.end();
  } catch (err) {
    console.error('❌ Error executing SQL:', err.message);
    process.exit(1);
  }
}

// Default behavior: run volunteer_history.sql
runSQLFile('./database/volunteer_history.sql');
