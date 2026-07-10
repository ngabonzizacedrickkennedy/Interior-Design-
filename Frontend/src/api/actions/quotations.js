import api from "../client";

export const getAllQuotations = () => api.get("/quotations");
export const getQuotationById = (id) => api.get(`/quotations/${id}`);
export const getQuotationByRequest = (requestId) => api.get(`/quotations/request/${requestId}`);
export const createQuotation = (requestId) => api.post(`/quotations/request/${requestId}`);
export const addLineItem = (id, body) => api.post(`/quotations/${id}/line-items`, body);
export const removeLineItem = (id, itemId) => api.delete(`/quotations/${id}/line-items/${itemId}`);
export const submitQuotation = (id) => api.patch(`/quotations/${id}/submit`);
export const approveQuotation = (id) => api.patch(`/quotations/${id}/approve`);
export const requestQuotationChange = (id) => api.patch(`/quotations/${id}/request-change`);
export const admitQuotation = (id) => api.patch(`/quotations/${id}/admit`);
export const denyQuotation = (id) => api.patch(`/quotations/${id}/deny`);
export const rejectQuotation = (id) => api.patch(`/quotations/${id}/reject`);
