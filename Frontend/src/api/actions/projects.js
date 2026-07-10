import api from "../client";

export const getAllProjects = () => api.get("/projects");
export const getMyProjects = () => api.get("/projects/mine");
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const getProjectsByClient = (clientId) => api.get(`/projects/client/${clientId}`);
export const getUnassignedProjects = () => api.get("/projects/unassigned");
export const getAssignedProjects = () => api.get("/projects/assigned");
export const getBlockedAmount = () => api.get("/projects/blocked-amount");
export const compensateProject = (id) => api.post(`/projects/${id}/compensate`);
export const assessProjectRequirement = (id) => api.post(`/projects/${id}/requirement-assessment`);
export const assignProject = (id, body) => api.post(`/projects/${id}/assign`, body);
export const updateMilestones = (id, milestones) =>
  api.patch(`/projects/${id}/milestones`, { milestones });
export const updateProjectStatus = (id, operationalStatus) =>
  api.patch(`/projects/${id}/status`, { operationalStatus });
