import api from "../client";

export const createStaff = (name) => api.post("/staff", { name });
export const getMyStaffs = () => api.get("/staff/mine");
export const getAllStaffs = () => api.get("/staff/all");
export const getStaffById = (id) => api.get(`/staff/${id}`);
export const inviteToStaff = (id, designerUserIds) => api.post(`/staff/${id}/invitations`, { designerUserIds });
export const getPendingStaffInvitations = () => api.get("/staff/invitations/pending");
export const acceptStaffInvitation = (membershipId) => api.patch(`/staff/invitations/${membershipId}/accept`);
export const declineStaffInvitation = (membershipId) => api.patch(`/staff/invitations/${membershipId}/decline`);
export const getStaffMessages = (id, since) => api.get(`/staff/${id}/messages`, { params: since ? { since } : {} });
export const postStaffMessage = (id, body) => api.post(`/staff/${id}/messages`, { body });
export const getStaffProjects = (id) => api.get(`/staff/${id}/projects`);
export const getStaffAccount = (id) => api.get(`/staff/${id}/account`);
export const splitStaffBalance = (id) => api.post(`/staff/${id}/split`);
