// database/runSQL.js
const fs = require("fs");
const path = require("path");
const db = require("../db");

async function runSQL(file) {
  try {
    const fullPath = path.resolve(__dirname, file);
    const sql = fs.readFileSync(fullPath, "utf8");

    console.log(`\n⏳ Running ${file}...`);
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await db.promise().query(stmt);
    }

    console.log(`✅ Finished: ${file}`);
  } catch (err) {
    console.error(`❌ Error in ${file}:`, err.message);
  }
}

(async () => {
  console.log("🚀 Starting SQL setup...");
  const files = ["volunteers.sql", "events.sql", "volunteer_history.sql"];

  for (const f of files) {
    await runSQL(f);
  }

  console.log("\n🎉 All SQL scripts executed successfully!");
  process.exit(0);
})();
