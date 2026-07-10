import api, { setToken, clearToken } from "../client";

export async function login(email, password) {
  const data = await api.post("/auth/login", { email, password });
  if (!data.otpRequired) setToken(data.token);
  return data;
}

export async function register(fullName, email, password, role) {
  const data = await api.post("/auth/register", { fullName, email, password, role });
  if (!data.otpRequired) setToken(data.token);
  return data;
}

export async function verifyOtp(email, code) {
  const data = await api.post("/auth/verify-otp", { email, code });
  setToken(data.token);
  return data;
}

export async function googleAuth(idToken, role) {
  const data = await api.post("/auth/google", { idToken, role });
  if (!data.otpRequired) setToken(data.token);
  return data;
}

export function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

export function resetPassword(token, newPassword) {
  return api.post("/auth/reset-password", { token, newPassword });
}

export function logout() {
  clearToken();
}
