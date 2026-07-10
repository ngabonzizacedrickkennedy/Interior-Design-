import api from "../client";

export const getAllClients = () => api.get("/clients");
export const getClientById = (id) => api.get(`/clients/${id}`);
export const getClientByUser = (userId) => api.get(`/clients/by-user/${userId}`);
export const createClient = (userId, body) => api.post(`/clients/user/${userId}`, body);
export const updateClient = (id, body) => api.put(`/clients/${id}`, body);
export const deleteClient = (id) => api.delete(`/clients/${id}`);
export const getCommunicationHistory = (id) => api.get(`/clients/${id}/communication-history`);
export const addCommunicationLog = (id, body) => api.post(`/clients/${id}/communication-history`, body);
