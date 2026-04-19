import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Notification {
  id: number;
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  type?: "STREAM" | "FOLLOW" | "COMMENT" | "VIDEO" | string;
  followFromDTO?: {
    attachmentResponseDTO?: { preSignedUrl?: string };
    username?: string;
    fullName?: string;
  };
}

export interface SystemNotification {
  id: number;
  title: string;
  body?: string;
  link?: string;
  imageUrl?: string;
  createdAt: string;
}

export function usePersonalNotifications() {
  return useQuery({
    queryKey: ["notifications", "personal"],
    queryFn: async () => {
      const { data } = await api.get("/notification/userNotifications?page=0&size=30");
      return (data?.data?.content ?? data?.data ?? []) as Notification[];
    },
  });
}

export function useSystemNotifications() {
  return useQuery({
    queryKey: ["notifications", "system"],
    queryFn: async () => {
      const { data } = await api.get("/notification/get");
      return (data?.data ?? []) as SystemNotification[];
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const { data } = await api.get("/notification/userUnReadNotificationCount");
      return (data?.data ?? 0) as number;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.put("/notification/readNotifications"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
