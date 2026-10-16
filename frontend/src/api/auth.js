import { api, refreshAccessToken, setAccessToken } from "./client";

export async function login(email, password) {
  const { data } = await api.post("/auth/login/", { email, password });
  setAccessToken(data.access);
  return data.user;
}

export async function register(details) {
  const { data } = await api.post("/auth/register/", details);
  return data;
}

export async function logout() {
  try {
    await api.post("/auth/logout/");
  } finally {
    setAccessToken(null);
  }
}

export async function getMe() {
  const { data } = await api.get("/auth/me/");
  return data;
}

// Called when the page first loads: if the refresh cookie is still valid,
// get a fresh access token and the user's profile.
export async function restoreSession() {
  await refreshAccessToken();
  return getMe();
}