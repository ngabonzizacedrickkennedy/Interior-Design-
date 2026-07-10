import api from "../client";

export const getStagingHistory = (requestId) => api.get(`/requests/${requestId}/staging`);
export const generateStaging = (requestId, attachmentId, style) =>
  api.post(`/requests/${requestId}/staging`, { attachmentId, style });
