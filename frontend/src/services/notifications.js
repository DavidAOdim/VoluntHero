import API from "../api";

export const getNotifications = (userId) =>
  API.get(`/notifications?userId=${userId}`);

export const markAsRead = (id) => API.patch(`/notifications/${id}/read`);
export const deleteNotification = (id) => API.delete(`/notifications/${id}`);
