const db = require("../src/config/db");

test("should connect to MySQL and return current time", (done) => {
  db.query("SELECT NOW() AS `current_time`", (err, results) => {
    if (err) {
      done(err);
    } else {
      console.log("✅ MySQL time:", results[0].current_time);
      expect(results[0]).toHaveProperty("current_time");
      db.end();
      done();
    }
  });
});
