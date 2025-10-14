const express = require('express'); //represents the API that we are building (handles routes)
const cors = require('cors'); //middleware to enable CORS (Cross-Origin Resource Sharing) allows frontend to call backend
const authRoutes = require('./routes/auth'); //importing authentication routes from a separate file
const profileRoutes = require('./routes/profile'); //importing profile routes from a separate file
const eventRoutes = require('./routes/event'); // import event routes

// Import volunteering modules (Hugo's)
const matchingRoutes = require('./modules/VolunteerMatching/routes');
const historyRoutes = require('./modules/VolunteerHistory/routes');

const app = express(); //creates an instance of an Express application
const PORT = 8080; //port number for the server to listen on

app.use(cors()); //enables CORS for all routes
app.use(express.json()); //middleware to parse incoming JSON requests

app.use('/auth', authRoutes); //mounts the authentication routes at the /auth path
app.use('/profile', profileRoutes); //mounts the profile routes at the /profile path
app.use('/events', eventRoutes);

//app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`)); //starts the server and listens for incoming requests
// Mount volunteer modules
app.use('/matching', matchingRoutes);
app.use('/history', historyRoutes);

// Hugo's contribution- Add a test route to verify your modules are loaded
app.get('/test-matching', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Matching module is working!',
        your_modules: 'Volunteer Matching & History by Vitor Santos' 
    });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`   it's alive on http://localhost:${PORT}`);
    console.log(`   Your endpoints available at:`);
    console.log(`   GET  /matching/event/:eventId`);
    console.log(`   POST /matching`);
    console.log(`   GET  /history/:volunteerId`);
    console.log(`   GET  /history/stats/:volunteerId`);
    console.log(`   POST /history - Add history record`);
    console.log(`   GET  /test-matching - Test route`);
  });
}

