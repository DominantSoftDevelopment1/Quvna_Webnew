import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProfile(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await api.get(`/user/profile/${userId}`);
      return data?.data ?? null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFollowers(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/followers/${userId}`, { params: { page: 0, size: 20 } });
        const raw = data?.data;
        return Array.isArray(raw) ? raw : (raw?.content ?? []);
      } catch { return []; }
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/following/${userId}`, { params: { page: 0, size: 20 } });
        const raw = data?.data;
        return Array.isArray(raw) ? raw : (raw?.content ?? []);
      } catch { return []; }
    },
    enabled: !!userId,
  });
}

export function useUserVideos(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["userVideos", userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/video/getUserVideos/${userId}`, { params: { page: 0, size: 20 } });
        const raw = data?.data;
        return Array.isArray(raw) ? raw : (raw?.content ?? []);
      } catch { return []; }
    },
    enabled: !!userId,
  });
}
