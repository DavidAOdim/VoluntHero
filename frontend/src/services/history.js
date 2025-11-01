// frontend/src/services/history.js
import API from "../api/api"; // ✅ uses your axios instance

// Fetch volunteer history
export const getHistory = (volunteerId) =>
  API.get(`/history/${volunteerId}`);

// Fetch volunteer stats
export const getStats = (volunteerId) =>
  API.get(`/history/stats/${volunteerId}`);

// Add new record
export const addHistoryRecord = (data) =>
  API.post("/history", data);

// Delete record
export const deleteHistoryRecord = (id) =>
  API.delete(`/history/${id}`);


// // =======================================
// // Frontend History Service (Axios)
// // =======================================
// import API from "../api/api";

// export const getHistory = (volunteerId) => API.get(`/history/${volunteerId}`);
// export const getStats = (volunteerId) => API.get(`/history/stats/${volunteerId}`);
// export const addHistoryRecord = (data) => API.post("/history", data);
// export const updateHistoryRecord = (id, data) => API.patch(`/history/${id}`, data);
// export const deleteHistoryRecord = (id) => API.delete(`/history/${id}`);

// // frontend/src/services/history.js
// import API from "../api/api.js";

// export const getHistory = async (volunteerId) => {
//   const response = await API.get(`/history/${volunteerId}`);
//   return response.data;
// };
