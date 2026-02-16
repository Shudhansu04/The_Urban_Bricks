import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

/** Convert backend image URLs to work with frontend (use path so Vite proxy serves uploads) */
export function getImageUrl(url) {
  if (!url || typeof url !== "string") return url;
  try {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    const fullApiUrl = apiBase.startsWith("http") ? apiBase : `${window.location.origin}${apiBase}`;
    const backendOrigin = new URL(fullApiUrl).origin;
    if (url.startsWith(backendOrigin)) {
      return url.replace(backendOrigin, "");
    }
  } catch (_) {}
  return url;
}

export default api;
