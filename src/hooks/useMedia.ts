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

export interface StreamListItem {
  id: number | string;
  name?: string;
  title?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  liveUserCount?: number;
  user?: {
    id?: number | string;
    username?: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    avatar?: string;
    attachmentResponseDTO?: { preSignedUrl?: string };
  };
}

function isYouTubeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isR2Video(v: VideoItem): boolean {
  const raw = v as unknown as Record<string, unknown>;
  const urls = [
    v.videoPSU,
    v.videoUrl,
    v.attachmentResponseDTO?.preSignedUrl,
    raw.url as string,
    raw.videoLink as string,
    raw.link as string,
  ].filter(Boolean) as string[];

  if (urls.length === 0) return false;
  return urls.every(u => !isYouTubeUrl(u));
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

function mapStreamList(list: Array<Record<string, unknown>>): StreamListItem[] {
  return list.map((item): StreamListItem => {
    const user = (item.user ?? {}) as Record<string, unknown>;
    const attachment = (user.attachmentResponseDTO ?? {}) as Record<string, unknown>;
    const firstName = typeof user.firstName === "string" ? user.firstName : "";
    const lastName = typeof user.lastName === "string" ? user.lastName : "";
    return {
      ...item,
      user: {
        ...user,
        avatar: (attachment.preSignedUrl as string | undefined) ?? undefined,
        fullName: `${firstName} ${lastName}`.trim(),
      },
    } as StreamListItem;
  });
}

export function useStreams() {
  return useQuery<StreamListItem[]>({
    queryKey: ["streams"],
    queryFn: async () => {
      try {
        const { data } = await api.get("/streams/all", {
          params: { page: 0, size: 20 },
          timeout: 5_000,
        });
        return mapStreamList((data?.data ?? []) as Array<Record<string, unknown>>);
      } catch {
        const { data } = await api.get("/streams", { timeout: 5_000 });
        return (data ?? []) as StreamListItem[];
      }
    },
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useVideoReactions(videoId: string) {
  return useQuery({
    queryKey: ["reactions", videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/reaction/reactions-by/${videoId}`);
      const all = data?.data ?? [];
      return all.filter((r: { type?: string }) => r.type === "COMMENT" || !r.type);
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
