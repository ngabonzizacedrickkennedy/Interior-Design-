import api from "../client";

export const getNotificationsByUser = (userId) => api.get(`/notifications/user/${userId}`);
export const getUnreadNotifications = (userId) => api.get(`/notifications/user/${userId}/unread`);
export const sendNotification = (body) => api.post("/notifications", body);
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
