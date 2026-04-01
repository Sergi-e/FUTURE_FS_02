import axios from "axios";
import { LEADRIFT_TOKEN_KEY, LEADRIFT_USER_KEY } from "../constants/session.js";

/** Base URL for REST calls (`/api` is appended). Set `VITE_API_URL` when the API is not on the default dev origin (no trailing slash). */
const devDefault =
  typeof import.meta !== "undefined" && import.meta.env?.DEV ? "" : "http://localhost:5000";
const raw = import.meta.env.VITE_API_URL ?? devDefault;
const origin = String(raw).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${origin}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(LEADRIFT_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isAuthPath(url) {
  if (!url) return false;
  const u = String(url);
  return u.includes("auth/login") || u.includes("auth/register");
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !isAuthPath(url)) {
      localStorage.removeItem(LEADRIFT_TOKEN_KEY);
      localStorage.removeItem(LEADRIFT_USER_KEY);
      window.dispatchEvent(new Event("leadrift:unauthorized"));
    }
    return Promise.reject(err);
  }
);

export default api;

/** Same origin as `api` but without `/api` — used by Socket.io. */
export function getApiOrigin() {
  return origin;
}
