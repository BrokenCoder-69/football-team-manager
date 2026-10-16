import axios from "axios";

// The access token lives only in this variable (in memory), never in
// localStorage, so a malicious script can't read it from storage (design §3.5).
let accessToken = null;
let refreshPromise = null;
let onSessionExpired = () => {};

export const api = axios.create({ baseURL: "/api/v1" });

export function setAccessToken(token) {
  accessToken = token;
}

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}

// Asks Django for a new access token using the httpOnly refresh cookie.
// If several requests need a refresh at the same moment, they all share
// one request instead of each sending their own.
export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/v1/auth/refresh/")
      .then((response) => {
        accessToken = response.data.access;
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Before every request: attach the access token.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// After every response: if the token has expired (401), refresh it once
// and repeat the original request. The user never notices.
const NO_RETRY = ["/auth/login/", "/auth/register/", "/auth/logout/"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const canRetry = request && !request._retried && !NO_RETRY.includes(request.url);

    if (error.response?.status === 401 && canRetry) {
      request._retried = true;
      try {
        await refreshAccessToken();
        return api(request);
      } catch {
        accessToken = null;
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  },
);