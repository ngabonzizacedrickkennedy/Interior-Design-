import api from "../client";

export const getAllTasks = () => api.get("/tasks");
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const getTasksByProject = (projectId) => api.get(`/tasks/project/${projectId}`);
export const getTasksByDesigner = (designerId) => api.get(`/tasks/designer/${designerId}`);
export const getOverdueTasks = () => api.get("/tasks/overdue");
export const getAssignableProjects = () => api.get("/tasks/assignable-projects");
export const getAssignableMembers = (projectId) => api.get(`/tasks/project/${projectId}/assignable-members`);
export const createTask = (body) => api.post("/tasks", body);
export const toggleTaskCompletion = (id) => api.patch(`/tasks/${id}/toggle`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
