import axios from "axios";

// Use relative /api in dev so requests go through Vite proxy (same origin = cookies work)
const rawApiUrl = import.meta.env.VITE_API_URL || "/api";

function normalizeApiBaseUrl(value) {
  const cleaned = value.replace(/\/+$/, "");

  // Keep local proxy path in development.
  if (cleaned.startsWith("/")) {
    return cleaned === "/api" ? cleaned : `${cleaned}/api`;
  }

  // For absolute URLs, ensure backend prefix exists.
  return /\/api$/i.test(cleaned) ? cleaned : `${cleaned}/api`;
}

const baseURL = normalizeApiBaseUrl(rawApiUrl);

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
