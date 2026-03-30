import axios from "axios";

// Talk to Express directly on port 5000 (CORS is enabled for the Vite dev origin).
// Override with VITE_API_URL in client/.env if you deploy the API elsewhere (no trailing slash).
const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
const origin = String(raw).replace(/\/$/, "");
const api = axios.create({
  baseURL: `${origin}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("leadrift_token");
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
