/**
 * Resolves property/project image URLs for display.
 * Rewrites backend URLs to relative paths when using Vite dev proxy,
 * so /uploads requests are proxied to the backend.
 */
export function getImageUrl(url) {
  if (!url) return url;
  const apiBase = import.meta.env.VITE_API_URL || "/api";
  let backendOrigin = apiBase.replace(/\/api\/?$/, "");
  if (!backendOrigin) {
    backendOrigin = "http://localhost:4000";
  }
  if (url.startsWith(backendOrigin)) {
    return url.replace(backendOrigin, "");
  }
  return url;
}
