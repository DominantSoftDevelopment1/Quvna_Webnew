import axios from "axios";
import { BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Platform": "WEB",
  },
});

// Watchdog Cloud monitoring integration
// providers.tsx ichida initWatchdogCloud() chaqirilgandan so'ng
// watchdog avtomatik ravishda Axios interceptor qo'shadi

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const skipAuthRedirect =
      String(
        (err?.config?.headers as Record<string, unknown> | undefined)?.["X-Skip-Auth-Redirect"] ?? ""
      ) === "1";
    // 502 Bad Gateway - backend qayta ishga tushganda retry qilish
    if (err.response?.status === 502 || err.code === 'ECONNREFUSED') {
      const maxRetries = 3;
      const retryDelay = 2000; // 2 soniya
      const retryCount = err.config.__retryCount || 0;

      if (retryCount < maxRetries) {
        err.config.__retryCount = retryCount + 1;
        console.log(`Backend unavailable, retrying... (${retryCount + 1}/${maxRetries})`);

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return api(err.config);
      }
    }

    if (err.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token") || localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          const { data } = await axios.patch(`${BASE_URL}/api/auth/refresh-token`, null, {
            headers: { refreshToken: refresh, "X-Platform": "WEB" },
          });
          const newToken = data?.data?.accessToken;
          if (newToken) {
            localStorage.setItem("access_token", newToken);
            localStorage.setItem("refresh_token", data?.data?.refreshToken);
            localStorage.setItem("accessToken", newToken);
            localStorage.setItem("refreshToken", data?.data?.refreshToken);
            err.config.headers.Authorization = `Bearer ${newToken}`;
            return api(err.config);
          }
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          if (!skipAuthRedirect) {
            window.location.href = "/auth/login";
          }
        }
      }
    }
    return Promise.reject(err);
  }
);
