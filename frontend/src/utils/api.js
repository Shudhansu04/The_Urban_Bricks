import axios from "axios";

// Use relative /api in dev so requests go through Vite proxy (same origin = cookies work)
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
