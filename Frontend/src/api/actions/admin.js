import api from "../client";

export const getAllUsers = () => api.get("/admin/users");
export const createManager = (body) => api.post("/admin/managers", body);
export const changeUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });
export const toggleUserEnabled = (id) => api.patch(`/admin/users/${id}/toggle-enabled`);
export const getAuditTrail = () => api.get("/admin/audit-trail");
export const getAuditTrailByOperator = (operatorId) =>
  api.get(`/admin/audit-trail/user/${operatorId}`);













