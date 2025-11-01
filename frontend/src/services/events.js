import API from "../api";

export const getEvents = () => API.get("/events");
export const getEvent = (id) => API.get(`/events/${id}`);
export const joinEvent = (id, volunteerId) =>
  API.post(`/events/${id}/join`, { volunteerId });
