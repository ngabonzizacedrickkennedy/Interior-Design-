import api from "../client";

export const getAllFeedback = () => api.get("/feedback");
export const getFeedbackByProject = (projectId) => api.get(`/feedback/project/${projectId}`);
export const getAverageRating = () => api.get("/feedback/average-rating");
export const submitFeedback = (body) => api.post("/feedback", body);
