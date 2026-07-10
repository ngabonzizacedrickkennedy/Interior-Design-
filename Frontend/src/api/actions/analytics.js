import api from "../client";

export const getAnalyticsSnapshot = () => api.get("/analytics");

export const getBusinessReport = (start, end) =>
  api.get("/analytics/report", { params: { start, end } });
