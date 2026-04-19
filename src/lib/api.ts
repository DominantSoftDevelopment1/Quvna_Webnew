import axios from "axios";
import { BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Platform": "WEB",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.patch(`${BASE_URL}/api/auth/refresh-token`, null, {
            headers: { refreshToken: refresh, "X-Platform": "WEB" },
          });
          const newToken = data?.data?.accessToken;
          if (newToken) {
            localStorage.setItem("access_token", newToken);
            localStorage.setItem("refresh_token", data?.data?.refreshToken);
            err.config.headers.Authorization = `Bearer ${newToken}`;
            return api(err.config);
          }
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/auth/login";
        }
      }
    }
    return Promise.reject(err);
  }
);
