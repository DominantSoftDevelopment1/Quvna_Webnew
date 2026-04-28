/**
 * Backend API bazasi.
 * Local dev: `/api-proxy` (Next rewrite orqali CORS muammosiz)
 * Mobil: `http://95.130.227.48:8066`
 * Swagger (dev): http://95.130.227.48:8066/swagger-ui/index.html
 * Brauzerda CORS muammo bo‘lsa: `.env.local` ga `NEXT_PUBLIC_API_BASE_URL=/api-proxy` (next.config rewrites).
 */
function apiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (process.env.NODE_ENV === "development") return "/api-proxy";
  return "https://quvna.dominantsoftdevelopment.uz";
}

export const BASE_URL = apiBaseUrl();
export const CDN_BASE_URL = "https://quvna-live.b-cdn.net";
export const WS_URL =
  BASE_URL.startsWith("/api-proxy") || BASE_URL.startsWith("https://")
    ? "wss://quvna.dominantsoftdevelopment.uz"
    : "ws://95.130.227.48:8066";

export const APP_NAME = "Quvna";
