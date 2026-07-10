import api, { getToken } from "../client";

export const getMyDesignerProfile = () => api.get("/designer-profiles/me");
export const updateMyDesignerProfileLinks = (body) => api.put("/designer-profiles/me", body);
export const getDesignerCandidates = () => api.get("/designer-profiles/candidates");
export const getDesignerAiSummary = (id) => api.get(`/designer-profiles/${id}/ai-summary`);
export const getAllDesignerProfiles = () => api.get("/designer-profiles");
export const approveDesignerProfile = (id) => api.patch(`/designer-profiles/${id}/approve`);
export const rejectDesignerProfile = (id) => api.patch(`/designer-profiles/${id}/reject`);

export async function uploadMyCv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/designer-profiles/me/cv", {
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
