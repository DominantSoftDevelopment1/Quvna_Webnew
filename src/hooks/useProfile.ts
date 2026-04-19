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
  });
}

export function useFollowers(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/followers/${userId}`);
      return data?.data ?? [];
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/following/${userId}`);
      return data?.data ?? [];
    },
    enabled: !!userId,
  });
}

export function useUserVideos(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["userVideos", userId],
    queryFn: async () => {
      const { data } = await api.get(`/api/video/getUserVideos/${userId}`);
      return data?.data ?? [];
    },
    enabled: !!userId,
  });
}
