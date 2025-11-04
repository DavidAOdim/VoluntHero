// frontend/src/api/matchingServer.js
import axios from "axios";

const API_URL = "http://localhost:8080/matching";

export async function getAllEvents() {
  try {
    const res = await axios.get("http://localhost:8080/events");
    return res.data;
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}

export async function getMatchesForEvent(eventId) {
  try {
    const res = await axios.get(`${API_URL}/event/${eventId}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching matches:", err);
    return { success: false, data: [] };
  }
}

export async function createMatch(volunteerId, eventId) {
  try {
    const res = await axios.post(API_URL, { volunteerId, eventId });
    return res.data;
  } catch (err) {
    console.error("Error creating match:", err);
    return { success: false };
  }
}

// import axios from "axios";
// const API_BASE = "http://localhost:8080";

// // Fetch all volunteers (from your backend)
// export async function getAllVolunteers() {
//   const res = await axios.get(`${API_BASE}/profile/all`);
//   return res.data;
// }

// // Fetch all events
// export async function getAllEvents() {
//   const res = await axios.get(`${API_BASE}/events`);
//   return res.data;
// }

// // Get matches for a specific event
// export async function getMatchesForEvent(eventId) {
//   const res = await axios.get(`${API_BASE}/matching/event/${eventId}`);
//   return res.data;
// }

// // Create a match and record it in history
// export async function createMatch(volunteerId, eventId) {
//   const res = await axios.post(`${API_BASE}/matching`, { volunteerId, eventId });
//   return res.data;
// }

// // frontend/src/api/matchingServer.js
// import axios from "axios";

// const API_BASE = "http://localhost:8080";

// // ✅ Get all events
// export const getAllEvents = async () => {
//   const res = await axios.get(`${API_BASE}/events`);
//   return res.data;
// };

// // ✅ Get volunteer matches for a given event
// export const getMatchesForEvent = async (eventId) => {
//   const res = await axios.get(`${API_BASE}/matching/event/${eventId}`);
//   return res.data;
// };

// // ✅ Create a volunteer match (also updates history)
// export const createMatch = async (volunteerId, eventId) => {
//   const res = await axios.post(`${API_BASE}/matching`, { volunteerId, eventId });
//   return res.data;
// };

// // ✅ Get all volunteers (fallback: profiles table)
// export const getAllVolunteers = async () => {
//   try {
//     const res = await axios.get(`${API_BASE}/profile/all`);
//     return res.data;
//   } catch (err) {
//     console.error("Error fetching volunteers:", err);
//     return [];
//   }
// };
