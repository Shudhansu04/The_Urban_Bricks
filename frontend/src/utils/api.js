import axios from "axios";

function getApiBaseUrl() {
  const url = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
  return url.endsWith("/api") ? url : url.replace(/\/?$/, "") + "/api";
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith("/api") && !config.url.startsWith("http")) {
    config.url = "/api" + (config.url.startsWith("/") ? config.url : "/" + config.url);
  }
  return config;
});

/** Convert backend image URLs to work with frontend (use path so Vite proxy serves uploads) */
export function getImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  try {
    const apiBase = getApiBaseUrl();
    const fullApiUrl = apiBase.startsWith("http") ? apiBase : `${window.location.origin}${apiBase}`;
    const backendOrigin = new URL(fullApiUrl).origin;
    if (url.startsWith(backendOrigin)) {
      return url.replace(backendOrigin, "");
    }
  } catch (_) {}
  return url;
}

export default api;
