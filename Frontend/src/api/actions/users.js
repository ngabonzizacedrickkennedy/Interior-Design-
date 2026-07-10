import api, { getToken } from "../client";

export const getMyProfile = () => api.get("/users/me");
export const updateMyProfile = (fullName) => api.patch("/users/me", { fullName });

export async function uploadMyAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/users/me/avatar`, {
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
