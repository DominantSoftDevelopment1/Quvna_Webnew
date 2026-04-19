import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface VideoItem {
  id: string;
  title?: string;
  videoPSU?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  attachmentResponseDTO?: { preSignedUrl?: string };
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewsCount?: number;
  isPressLike?: boolean;
  isPressDisLike?: boolean;
  hideLikes?: boolean;
  hideSharing?: boolean;
  userResponseDTO?: {
    id?: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    attachmentResponseDTO?: { preSignedUrl?: string };
    currentUserIsFollower?: boolean;
  };
}

export interface CommentItem {
  id: string;
  text?: string;
  createdAt?: string;
  likeCount?: number;
  userResponseDTO?: {
    id?: number;
    username?: string;
    attachmentResponseDTO?: { preSignedUrl?: string };
  };
}

function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isR2Video(v: VideoItem): boolean {
  const videoUrl = v.videoPSU ?? v.videoUrl ?? v.attachmentResponseDTO?.preSignedUrl;
  if (!videoUrl) return false;
  return !isYouTubeUrl(videoUrl);
}

export function useVideos(page = 0) {
  return useQuery({
    queryKey: ["videos", page],
    queryFn: async () => {
      const { data } = await api.get("/api/video/all/video", {
        params: { page, size: 20 },
      });
      const raw = data?.data ?? { content: [], totalPages: 0 };
      return { ...raw, content: (raw.content ?? []).filter(isR2Video) };
    },
  });
}

export interface ShortsPage {
  content: VideoItem[];
  last: boolean;
  number: number;
}

export function useInfiniteShorts() {
  return useInfiniteQuery({
    queryKey: ["shorts-infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await api.get("/api/video/all/video", {
        params: { page: pageParam, size: 20 },
      });
      const raw = data?.data;
      const page: ShortsPage = Array.isArray(raw)
        ? { content: raw as VideoItem[], last: true, number: 0 }
        : (raw ?? { content: [], last: true, number: 0 });
      return { ...page, content: page.content.filter(isR2Video) };
    },
    initialPageParam: 0,
    getNextPageParam: (last: ShortsPage) =>
      last.last ? undefined : (last.number ?? 0) + 1,
  });
}

export function useStreams() {
  return useQuery({
    queryKey: ["streams"],
    queryFn: async () => {
      const { data } = await api.get("/streams/all");
      return data?.data ?? [];
    },
  });
}

export function useVideoReactions(videoId: string) {
  return useQuery({
    queryKey: ["reactions", videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/reaction/reactions-by/${videoId}`);
      return data?.data ?? [];
    },
    enabled: !!videoId,
  });
}

export function useLikeVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, isLiked }: { videoId: string; isLiked: boolean }) =>
      api.post("/api/reaction/create", { videoId, type: "LIKE", pressed: !isLiked }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shorts-infinite"] });
    },
  });
}

export function useFollowUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.post(`/api/follow/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shorts-infinite"] });
    },
  });
}

export function useSendComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ videoId, text }: { videoId: string; text: string }) =>
      api.post("/api/reaction/create", { videoId, type: "COMMENT", text }),
    onSuccess: (_data, { videoId }) => {
      qc.invalidateQueries({ queryKey: ["reactions", videoId] });
    },
  });
}

export function useUsers(page = 0) {
  return useQuery({
    queryKey: ["users", page],
    queryFn: async () => {
      const { data } = await api.get("/api/user/all", { params: { page, size: 20 } });
      return data?.data ?? { content: [] };
    },
  });
}
