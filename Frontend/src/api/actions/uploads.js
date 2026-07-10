import { getToken } from "../client";

export async function uploadAttachment({ requestId, category, file, note }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (note) formData.append("note", note);

  const response = await fetch(`/api/requests/${requestId}/attachments`, {
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
