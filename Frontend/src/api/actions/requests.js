import api from "../client";

export const getAllRequests = () => api.get("/requests");
export const getRequestById = (id) => api.get(`/requests/${id}`);
export const getRequestsByClient = (clientId) => api.get(`/requests/client/${clientId}`);
export const getRequestsByStaff = (staffId) => api.get(`/requests/staff/${staffId}`);
export const getMyRequests = () => api.get("/requests/mine");
export const createRequest = (body) => api.post("/requests", body);
export const assignStaff = (id, staffId) => api.patch(`/requests/${id}/assign`, { staffId });
export const updateRequestStatus = (id, executionStatus) =>
  api.patch(`/requests/${id}/status`, { executionStatus });
export const deleteRequest = (id) => api.delete(`/requests/${id}`);

export const createDraftRequest = () => api.post("/requests/draft");
export const updateDraftRequest = (id, body) => api.patch(`/requests/${id}/draft`, body);
export const submitRequest = (id) => api.post(`/requests/${id}/submit`);
export const withdrawRequest = (id) => api.delete(`/requests/${id}/withdraw`);

export const getAttachments = (requestId) => api.get(`/requests/${requestId}/attachments`);
export const updateAttachmentNote = (requestId, attachmentId, note) =>
  api.patch(`/requests/${requestId}/attachments/${attachmentId}`, { note });
export const deleteAttachment = (requestId, attachmentId) =>
  api.delete(`/requests/${requestId}/attachments/${attachmentId}`);
