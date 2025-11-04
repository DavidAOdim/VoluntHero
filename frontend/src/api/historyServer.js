// frontend/src/api/historyServer.js
import axios from "axios";

const API_BASE = "http://localhost:8080";

// ✅ Get full volunteer history
export const getVolunteerHistory = async (volunteerId) => {
  const res = await axios.get(`${API_BASE}/history/${volunteerId}`);
  return res.data;
};

// ✅ Get volunteer statistics
export const getVolunteerStats = async (volunteerId) => {
  const res = await axios.get(`${API_BASE}/history/stats/${volunteerId}`);
  return res.data;
};

// ✅ Add history record manually
export const addHistoryRecord = async (payload) => {
  const res = await axios.post(`${API_BASE}/history`, payload);
  return res.data;
};
