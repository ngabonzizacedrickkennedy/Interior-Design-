import api, { getToken } from "../client";

export const getBackgroundVideo = () => api.get("/site-background-video");

export async function uploadBackgroundVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/site-background-video", {
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
