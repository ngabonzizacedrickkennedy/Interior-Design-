import api from "../client";

export const generateInterview = () => api.post("/interviews/generate");
export const submitInterview = (id, transcript) => api.post(`/interviews/${id}/submit`, { transcript });
export const getMyLatestInterview = () => api.get("/interviews/me/latest");
