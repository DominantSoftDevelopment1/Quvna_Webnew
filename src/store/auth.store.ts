import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number | string;
  username?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  avatar?: string;
  attachmentResponseDTO?: { preSignedUrl?: string };
  score?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (access, refresh) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
        }
        set({ accessToken: access, refreshToken: refresh });
      },
      setUser: (user) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("userId", String(user.id ?? ""));
        }
        set({ user });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("userId");
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
      isLoggedIn: () => !!get().accessToken,
    }),
    {
      name: "quvna-auth",
      skipHydration: true,
    }
  )
);
