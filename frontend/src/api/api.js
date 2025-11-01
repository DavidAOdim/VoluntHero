// =======================================
// Axios base configuration
// =======================================
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

export default API;


// // frontend/src/api/api.js
// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:8080",
// });

// export default API;

