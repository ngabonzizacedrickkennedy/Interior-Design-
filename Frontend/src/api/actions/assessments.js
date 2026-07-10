import api from "../client";

export const triggerAssessment = (requestId) => api.post(`/requests/${requestId}/assessments`);
export const getAssessments = (requestId) => api.get(`/requests/${requestId}/assessments`);
export const getLatestAssessment = (requestId) => api.get(`/requests/${requestId}/assessments/latest`);
export const remainAssessment = (requestId, assessmentId) =>
  api.post(`/requests/${requestId}/assessments/${assessmentId}/remain`);
export const adjustBudget = (requestId, newBudget) =>
  api.patch(`/requests/${requestId}/budget`, { newBudget });
