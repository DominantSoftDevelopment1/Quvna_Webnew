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
  // next start lokal mashina / tugun — tashqi API ga to'g'ridan URILSAM CORS (README `/api-proxy`).
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return "/api-proxy";
    if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
      const [a, b] = h.split(".").map(Number);
      if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return "/api-proxy";
    }
  }
  return "https://quvna.dominantsoftdevelopment.uz";
}

export const BASE_URL = apiBaseUrl();
export const CDN_BASE_URL = "https://quvna-live.b-cdn.net";

/**
 * Chat WebSocket bazasi; to‘liq URL: `{WS_URL}/scws/{streamId}` (stream `id` backenddan).
 * Masalan: `ws://quvna.dominantsoftdevelopment.uz/scws/{id}` yoki `wss://...`.
 * `.env.local`: `NEXT_PUBLIC_WS_URL=ws://quvna.dominantsoftdevelopment.uz` yoki `wss://...`
 */
function wsBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (BASE_URL.startsWith("/api-proxy") || BASE_URL.startsWith("https://"))
    return "wss://quvna.dominantsoftdevelopment.uz";
  return "ws://95.130.227.48:8066";
}

export const WS_URL = wsBaseUrl();

export const APP_NAME = "Quvna";
