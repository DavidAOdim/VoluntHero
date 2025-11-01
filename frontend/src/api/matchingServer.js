// frontend/src/api/matchingServer.js
import axios from "axios";

const API_BASE = "http://localhost:8080"; // backend URL

// ✅ Get all events from DB (for dropdown)
export const getAllEvents = async () => {
  const res = await axios.get(`${API_BASE}/events`);
  return res.data;
};

// ✅ Get matches for a specific event
export const getMatchesForEvent = async (eventId) => {
  const res = await axios.get(`${API_BASE}/matching/event/${eventId}`);
  return res.data;
};

// ✅ Create a new volunteer match
export const createMatch = async (volunteerId, eventId) => {
  const res = await axios.post(`${API_BASE}/matching`, {
    volunteerId,
    eventId,
  });
  return res.data;
};

// ✅ Get all volunteers from the backend (if endpoint exists)
// export const getAllVolunteers = async () => {
//   try {
//     const res = await axios.get(`${API_BASE}/profile/all`);
//     return res.data;
//   } catch {
//     return [];
//   }
// };
export const getAllVolunteers = async () => {
  const res = await fetch("http://localhost:8080/profile/all");
  return res.json();
};
