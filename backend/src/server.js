const express = require('express'); //represents the API that we are building (handles routes)
const cors = require('cors'); //middleware to enable CORS (Cross-Origin Resource Sharing) allows frontend to call backend
const authRoutes = require('./routes/auth'); //importing authentication routes from a separate file
const profileRoutes = require('./routes/profile'); //importing profile routes from a separate file

const app = express(); //creates an instance of an Express application
const PORT = 8080; //port number for the server to listen on

app.use(cors()); //enables CORS for all routes
app.use(express.json()); //middleware to parse incoming JSON requests

app.use('/auth', authRoutes); //mounts the authentication routes at the /auth path
app.use('/profile', profileRoutes); //mounts the profile routes at the /profile path

app.listen(PORT, () => console.log(`it's alive on http://localhost:${PORT}`)); //starts the server and listens for incoming requests