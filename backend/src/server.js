// ==============================
// 🚀 VoluntHero Backend Server
// Author: Team VoluntHero
// Contributor: Vitor Hugo Santos
// ==============================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ✅ DB connector (shared project root)
const db = require(path.resolve(__dirname, '../../db'));

// ==============================
// 🔗 ROUTE IMPORTS
// ==============================
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const eventRoutes = require('./routes/event');
const notificationRoutes = require('./routes/notifications');

// 💪 Volunteer Modules (Hugo)
const matchingRoutes = require('./modules/VolunteerMatching/routes');
const historyRoutes = require('./modules/VolunteerHistory/routes');

// ==============================
// ⚙️ EXPRESS APP CONFIG
// ==============================
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ==============================
// 🧩 ROUTE MOUNTING
// ==============================

// Core routes
app.use('/auth', authRoutes);
console.log('Mounted /auth');

app.use('/profile', profileRoutes);
console.log('Mounted /profile');

app.use('/events', eventRoutes);
console.log('Mounted /events');

app.use('/notifications', notificationRoutes);
console.log('Mounted /notifications');

// Volunteer modules (Hugo)
app.use('/matching', (req, _res, next) => {
  console.log('🧭 /matching reached ->', req.method, req.url);
  next();
}, matchingRoutes);
console.log('Mounted /matching');

app.use('/history', (req, _res, next) => {
  console.log('🧭 /history reached ->', req.method, req.url);
  next();
}, historyRoutes);
console.log('Mounted /history');

app.use("/volunteers", require("./routes/volunteers"));

// ==============================
// 🧭 TEST ROUTES
// ==============================
app.get('/test-matching', (_req, res) => {
  res.json({
    success: true,
    message: 'Matching module is working!',
    your_modules: 'Volunteer Matching & Volunteer History by Vitor Hugo Santos',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'VoluntHero API',
    time: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.send('<h2>Welcome to VoluntHero API 🚀</h2><p>Server is running successfully.</p>');
});

// ==============================
// 💾 DATABASE CONNECTION CHECK
// ==============================
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connection established successfully.');
    connection.release();
  }
});

// ==============================
// 🖥️ START SERVER
// ==============================
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`💾 Connected to DB: ${process.env.DB_NAME} @ ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log('\n📡 Endpoints:');
    console.log('   GET  /matching/event/:eventId          - Find volunteer matches for event');
    console.log('   POST /matching                         - Create new volunteer match');
    console.log('   GET  /history/:volunteerId             - View volunteer history');
    console.log('   GET  /history/stats/:volunteerId       - View volunteer stats');
    console.log('   POST /history                          - Add volunteer history record');
    console.log('   GET  /notifications?userId=:id         - Fetch user notifications');
    console.log('   POST /notifications                    - Create notification');
    console.log('   PATCH /notifications/:id/read          - Mark notification read');
    console.log('   DELETE /notifications/:id              - Delete notification');
    console.log('   GET  /test-matching                    - Test volunteer modules');
  });

  // Graceful shutdown handler
  process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    server.close(() => process.exit(0));
  });
}

// ==============================
// 🚨 GLOBAL ERROR HANDLING
// ==============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  console.error('💥 Uncaught error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

module.exports = app;

// const express = require('express'); // represents the API that we are building (handles routes)
// const cors = require('cors'); // middleware to enable CORS (Cross-Origin Resource Sharing) allows frontend to call backend
// const authRoutes = require('./routes/auth'); // importing authentication routes from a separate file
// const profileRoutes = require('./routes/profile'); // importing profile routes from a separate file
// const eventRoutes = require('./routes/event'); // import event routes
// const db = require("../../db");

// // Import volunteering modules (Hugo's)
// const matchingRoutes = require('./modules/VolunteerMatching/routes');
// const historyRoutes = require('./modules/VolunteerHistory/routes');

// // ✅ Import notifications routes
// const notificationRoutes = require('./routes/notifications');

// const app = express(); // creates an instance of an Express application
// const PORT = 8080; // port number for the server to listen on

// app.use(cors()); // enables CORS for all routes
// app.use(express.json()); // middleware to parse incoming JSON requests

// // Mount core routes
// app.use('/auth', authRoutes);
// app.use('/profile', profileRoutes);
// app.use('/events', eventRoutes);

// // Mount volunteer modules
// app.use('/matching', matchingRoutes);
// app.use('/history', historyRoutes);

// // ✅ Mount notifications routes
// app.use('/notifications', notificationRoutes);

// // Hugo's contribution - Add a test route to verify your modules are loaded
// app.get('/test-matching', (req, res) => {
//   res.json({
//     success: true,
//     message: 'Matching module is working!',
//     your_modules: 'Volunteer Matching & History by Vitor Santos'
//   });
// });

// if (require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`   it's alive on http://localhost:${PORT}`);
//     console.log(`   Your endpoints available at:`);
//     console.log(`   GET  /matching/event/:eventId`);
//     console.log(`   POST /matching`);
//     console.log(`   GET  /history/:volunteerId`);
//     console.log(`   GET  /history/stats/:volunteerId`);
//     console.log(`   POST /history - Add history record`);
//     console.log(`   GET  /notifications?userId=:id`);
//     console.log(`   POST /notifications`);
//     console.log(`   PATCH /notifications/:id/read`);
//     console.log(`   DELETE /notifications/:id`);
//     console.log(`   GET  /test-matching - Test route`);
//   });
// }

// module.exports = app;
