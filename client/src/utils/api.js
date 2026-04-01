import axios from "axios";
import { LEADRIFT_TOKEN_KEY } from "../constants/session.js";

/** Base URL for REST calls (`/api` is appended). Set `VITE_API_URL` when the API is not on the default dev origin (no trailing slash). */
const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
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
  return url.includes("/auth/login") || url.includes("/auth/register");
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !isAuthPath(url)) {
      localStorage.removeItem("leadrift_token");
      localStorage.removeItem("leadrift_user");
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
