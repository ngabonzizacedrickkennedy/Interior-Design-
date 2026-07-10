import api, { getToken } from "../client";

export const getAllDocuments = () => api.get("/documents");
export const getApprovedDocuments = () => api.get("/documents/approved");
export const getDocumentById = (id) => api.get(`/documents/${id}`);
export const getDocumentsByProject = (projectId) => api.get(`/documents/project/${projectId}`);
export const uploadDocument = (body) => api.post("/documents", body);
export const incrementDocumentVersion = (id) => api.patch(`/documents/${id}/new-version`);
export const approveDocument = (id) => api.patch(`/documents/${id}/approve`);
export const rejectDocument = (id) => api.patch(`/documents/${id}/reject`);
export const analyzeDocument = (id) => api.post(`/documents/${id}/ai-analysis`);

export async function uploadDocumentFile(projectId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/documents/upload?projectId=${projectId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Upload failed (${response.status})`);
  }
  return response.json();
}
