import API from "../api";

export const getProfile = (id) => API.get(`/profile/${id}`);
export const updateProfile = (id, data) => API.patch(`/profile/${id}`, data);
