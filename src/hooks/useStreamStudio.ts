"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { type AxiosError } from "axios";
import Hls from "hls.js";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BASE_URL, WS_URL } from "@/lib/constants";
import {
  getStoredStreamUserId,
  inferLineIsStreamHost,
  parseStreamChatInbound,
  flattenStreamChatWsPayload,
} from "@/lib/streamChat";
import { fetchStreamChatHistory } from "@/lib/streamChatHistory";
import type { StudioChatItem } from "@/components/stream/StudioChatPanel";
import { chatUsernameColorClass } from "@/components/stream/StreamChatPanel";
import { buildStreamWsUrl } from "@/lib/streamWs";
import { deriveStreamRestPathId, pickStreamEntityId } from "@/lib/streamIds";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "@/hooks/useProfile";
import { cdnUrl } from "@/lib/utils";
import type { StreamStudioController, StreamDto, ChatMessage, StreamStatus } from "@/components/stream/studio/streamStudioTypes";

const HASHTAGS_KEY = "quvna_stream_studio_hashtags";
const PINNED_KEY = "quvna_stream_studio_pinned";

function formatChatClock(ms: number | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function normalizeStreamDtoFromApi(payload: unknown): StreamDto | null {
  const asObj = (v: unknown): Record<string, unknown> | null =>
    v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

  let layer = asObj(payload);
  if (!layer) return null;

  for (let depth = 0; depth < 3; depth++) {
    const id = pickStreamEntityId(layer);
    if (id) {
      const restPk = deriveStreamRestPathId(layer);
      const restPathId = restPk ?? id;
      return {
        id,
        restPathId,
        ...(typeof layer.name === "string" ? { name: layer.name } : {}),
        ...(typeof layer.isLive === "boolean" ? { isLive: layer.isLive } : {}),
        ...(typeof layer.url === "string" ? { url: layer.url } : {}),
        ...(typeof layer.fileId === "number" ? { fileId: layer.fileId } : {}),
        ...(typeof layer.clickCount === "number" ? { clickCount: layer.clickCount } : {}),
      };
    }
    const next = asObj(layer.data);
    if (!next) break;
    layer = next;
  }
  return null;
}

interface CreateStreamPayload {
  name: string;
  url: string;
  fileId: number;
  clickCount: number;
  isLive: boolean;
}

function stopStreamErrorMessage(err: unknown): string {
  const ax = err as AxiosError<{ message?: string; error?: string }>;
  const data = ax.response?.data;
  const m = data && typeof data === "object" ? (data.message ?? data.error) : undefined;
  if (typeof m === "string" && m.trim()) return m.trim();
  if (typeof ax.message === "string" && ax.message) return ax.message;
  return "Streamni to'xtatib bo'lmadi.";
}

function buildRtmpServerUrl(baseUrl: string): string {
  try {
    const parsed = new URL(baseUrl);
    return `rtmp://${parsed.host}/live`;
  } catch {
    return "rtmp://quvna.dominantsoftdevelopment.uz/live";
  }
}

function getApiCandidates(): string[] {
  return Array.from(
    new Set([BASE_URL.replace(/\/$/, ""), "https://quvna.dominantsoftdevelopment.uz", "/api-proxy"])
  );
}

function buildHlsCandidates(streamId: string): string[] {
  const cdn = "https://quvna-live.b-cdn.net";
  const origin = "https://quvna.dominantsoftdevelopment.uz";
  const proxy = "/hls-proxy";
  return [
    `${proxy}/hls/${streamId}.m3u8`,
    `${proxy}/hls/${streamId}/playlist.m3u8`,
    `${proxy}/${streamId}/playlist.m3u8`,
    `${cdn}/hls/${streamId}.m3u8`,
    `${cdn}/hls/${streamId}/playlist.m3u8`,
    `${cdn}/${streamId}/playlist.m3u8`,
    `${origin}/hls/${streamId}.m3u8`,
    `${origin}/hls/${streamId}/playlist.m3u8`,
  ];
}

function persistKey(): string {
  return "quvna_stream_studio_state";
}

function readJsonTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim());
  } catch {
    return [];
  }
}

export function useStreamStudio(): StreamStudioController & {
  streamPutPathId: string | null;
  hlsUrl: string;
  hlsCandidates: string[];
  hlsIndex: number;
} {
  const router = useRouter();
  const queryClient = useQueryClient();
  const storeUser = useAuthStore((s) => s.user);
  const profileUserId = useMemo(() => {
    if (storeUser?.id != null) {
      const n = Number(storeUser.id);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return getStoredStreamUserId();
  }, [storeUser]);
  const { data: profileData, isPending: profilePending } = useProfile(profileUserId);

  const [myDisplayName, setMyDisplayName] = useState<string>(() => {
    if (typeof window === "undefined") return "Men";
    const cached = localStorage.getItem("quvna_stream_username") ?? "";
    if (cached) return cached;
    const u = useAuthStore.getState().user;
    return (
      (typeof u?.username === "string" && u.username.trim()) ||
      (typeof u?.fullName === "string" && u.fullName.trim()) ||
      (typeof u?.firstName === "string" && u.firstName.trim()) ||
      "Men"
    );
  });

  useEffect(() => {
    const p = profileData as Record<string, unknown> | null | undefined;
    if (!p) return;
    queueMicrotask(() => {
      const username = typeof p.username === "string" ? p.username.trim() : "";
      if (username) {
        localStorage.setItem("quvna_stream_username", username);
        setMyDisplayName(username);
        return;
      }
      const fullName = typeof p.fullName === "string" ? p.fullName.trim() : "";
      if (fullName) setMyDisplayName(fullName);
    });
  }, [profileData]);

  const [title, setTitle] = useState("PUBG Mobile turnir — jonli efir");
  const [game, setGame] = useState("PUBG MOBILE");
  const [status, setStatus] = useState<StreamStatus>("offline");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [streamPutPathId, setStreamPutPathId] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState("");
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [ownerMessage, setOwnerMessage] = useState("");
  const [studioSocketHint, setStudioSocketHint] = useState<string | null>(null);
  const [chatHistoryStatus, setChatHistoryStatus] = useState<"loading" | "ready" | "failed">("ready");
  const [chatPanelError, setChatPanelError] = useState<string | null>(null);
  const [watchCopied, setWatchCopied] = useState(false);
  const [hlsIndex, setHlsIndex] = useState(0);
  const [hlsPlaying, setHlsPlaying] = useState(false);
  const [overlayText, setOverlayText] = useState(
    "Salom do'stlar! Bugun PUBG Mobile turnir finalini jonli efirda kuzatamiz 🎮🔥"
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overlayImages, setOverlayImages] = useState<string[]>([]);
  const [pinnedMessage, setPinnedMessage] = useState(() => {
    if (typeof window === "undefined") return "Qoidalarga rioya qiling! Spam va haqorat taqiqlanadi.";
    return localStorage.getItem(PINNED_KEY)?.trim() || "Qoidalarga rioya qiling! Spam va haqorat taqiqlanadi.";
  });
  const [hashtags, setHashtags] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["uzbekistan", "coding", "live"];
    const tags = readJsonTags(localStorage.getItem(HASHTAGS_KEY));
    return tags.length ? tags : ["uzbekistan", "coding", "live"];
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(HASHTAGS_KEY, JSON.stringify(hashtags));
    } catch {
      /* ignore */
    }
  }, [hashtags]);

  useEffect(() => {
    try {
      localStorage.setItem(PINNED_KEY, pinnedMessage);
    } catch {
      /* ignore */
    }
  }, [pinnedMessage]);

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const pendingSentTexts = useRef<Set<string>>(new Set());
  const userNameCache = useRef<Map<number, string>>(new Map());
  const myDisplayNameRef = useRef(myDisplayName);

  useEffect(() => {
    myDisplayNameRef.current = myDisplayName;
    queueMicrotask(() => {
      setChatMessages((prev) => prev.map((m) => (m.isMe ? { ...m, user: myDisplayName } : m)));
    });
  }, [myDisplayName]);

  const serverUrl = useMemo(() => buildRtmpServerUrl(BASE_URL), []);
  const hlsCandidates = useMemo(() => (streamId ? buildHlsCandidates(streamId) : []), [streamId]);
  const hlsUrl = hlsCandidates[hlsIndex] ?? "";

  const saveState = (id: string, key: string, putPath: string) => {
    localStorage.setItem(persistKey(), JSON.stringify({ id, key, putPath }));
  };

  const clearState = () => {
    localStorage.removeItem(persistKey());
  };

  const requestWithFallback = async <T,>(method: "get" | "post" | "put", path: string, body?: unknown): Promise<T> => {
    const token = localStorage.getItem("access_token");
    const headers = token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Platform": "WEB" }
      : { "Content-Type": "application/json", "X-Platform": "WEB" };

    let lastErr: unknown = null;
    for (const base of getApiCandidates()) {
      try {
        const { data } = await axios.request<T>({ method, url: `${base}${path}`, data: body, headers });
        return data;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  };

  const applyStream = (stream: StreamDto, forceWaiting = false) => {
    const sid = String(stream.id);
    const put = String(stream.restPathId || sid);
    setStreamId(sid);
    setStreamPutPathId(put);
    setStreamKey(sid);
    saveState(sid, sid, put);
    if (stream.name?.trim()) setTitle(stream.name);
    setStatus(forceWaiting ? "waiting" : stream.isLive ? "live" : "waiting");
  };

  const loadExistingStream = async () => {
    try {
      const data = await requestWithFallback<unknown>("get", "/streams/if-exist/user-stream");
      const dto = normalizeStreamDtoFromApi(data);
      if (dto) {
        applyStream(dto);
      } else {
        clearState();
        setStreamId(null);
        setStreamPutPathId(null);
        setStreamKey("");
        setStatus("offline");
      }
    } catch {
      /* network */
    }
  };

  const createStream = async () => {
    if (busy) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Login qilinmagan. Avval akkauntga kiring.");
      // router.push("/auth/login"); // Vaqtinchalik o'chirilgan
      return;
    }
    if (streamId && streamKey) {
      void loadExistingStream();
      return;
    }
    if (!title.trim()) {
      setError("Avval stream nomini kiriting.");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      const payload: CreateStreamPayload = {
        name: title.trim(),
        url: serverUrl,
        fileId: 0,
        clickCount: 0,
        isLive: true,
      };
      const data = await requestWithFallback<unknown>("post", "/streams/create", payload);
      const dto = normalizeStreamDtoFromApi(data);
      if (dto) {
        applyStream(dto, true);
        void queryClient.invalidateQueries({ queryKey: ["streams"] });
      } else setError("Server stream id qaytarmadi.");
    } catch (err) {
      const statusCode = (err as AxiosError)?.response?.status;
      if (statusCode === 401 || statusCode === 403) {
        setError("Ruxsat yo'q. Qayta login qiling.");
        // router.push("/auth/login"); // Vaqtinchalik o'chirilgan
      } else {
        setError("Stream yaratishda xatolik bo'ldi.");
      }
    } finally {
      setBusy(false);
    }
  };

  const stopStream = async () => {
    if (!streamId || busy) return;
    const restSeg = streamPutPathId ?? streamId;
    const sid = encodeURIComponent(restSeg);
    try {
      setBusy(true);
      setError(null);
      await requestWithFallback("put", `/streams/${sid}`, { isLive: false });
      setStatus("offline");
      setStreamId(null);
      setStreamPutPathId(null);
      setStreamKey("");
      setLiveUserCount(0);
      clearState();
      wsRef.current?.close();
      wsRef.current = null;
      void queryClient.invalidateQueries({ queryKey: ["streams"] });
    } catch (e) {
      setError(stopStreamErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const startLive = () => {
    if (!streamId) {
      setError("Avval Stream yaratish tugmasini bosing.");
      return;
    }
    setStatus("live");
    setError(null);
  };

  const regenerateKey = async () => {
    if (busy) return;
    if (streamId) await stopStream();
    clearState();
    setStreamId(null);
    setStreamPutPathId(null);
    setStreamKey("");
    await createStream();
  };

  const sendChat = (role: "owner" | "moderator", text: string) => {
    const msg = text.trim();
    if (!msg) return;
    const senderId = getStoredStreamUserId();
    const username = myDisplayName;
    if (senderId == null) {
      setChatPanelError("Chat uchun akkauntga kiring.");
      return;
    }
    if (!streamId) {
      setChatPanelError("Avval stream yarating.");
      return;
    }
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setChatPanelError("Chat ulanishi tayyor emas — biroz kuting.");
      return;
    }
    setChatPanelError(null);
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pendingSentTexts.current.add(msg);
    setChatMessages((prev) => [
      ...prev,
      {
        id: localId,
        role: "owner",
        user: username,
        text: msg,
        isHost: true,
        isMe: true,
        sentAtMs: Date.now(),
      },
    ]);
    window.setTimeout(() => pendingSentTexts.current.delete(msg), 5000);
    wsRef.current.send(
      JSON.stringify({
        action: "streamChatMessage",
        streamId,
        userId: senderId,
        message: msg,
        ...(username ? { username, senderName: username, displayName: username } : {}),
      })
    );
    if (role === "owner") setOwnerMessage("");
  };

  useEffect(() => {
    queueMicrotask(() => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Login qilinmagan. Avval akkauntga kiring.");
        // router.push("/auth/login"); // Vaqtinchalik o'chirilgan
        return;
      }

      const saved = localStorage.getItem(persistKey());
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { id?: string; key?: string; putPath?: string };
          if (parsed.id && parsed.key) {
            setStreamId(parsed.id);
            setStreamKey(parsed.key);
            setStreamPutPathId(parsed.putPath?.trim() || parsed.id);
            setStatus("waiting");
          }
        } catch {
          /* ignore */
        }
      }
      void loadExistingStream();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    queueMicrotask(() => {
      setHlsIndex(0);
      setHlsPlaying(false);
    });
  }, [streamId]);

  useEffect(() => {
    const sid = streamId?.trim();
    if (!sid) {
      queueMicrotask(() => {
        setStudioSocketHint(null);
        setChatHistoryStatus("ready");
        setChatMessages([]);
      });
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    let cancelled = false;

    const run = async () => {
      setStudioSocketHint("Chat tarixi yuklanmoqda…");
      setChatHistoryStatus("loading");
      try {
        const lines = await fetchStreamChatHistory(sid, { page: 0, size: 10 });
        if (cancelled) return;
        const hostId = getStoredStreamUserId();
        const mapped: ChatMessage[] = lines.map((line) => {
          const isHost = inferLineIsStreamHost(line, hostId ?? undefined);
          if (line.senderUserId != null && line.user && line.user !== "viewer" && !line.user.startsWith("user_")) {
            userNameCache.current.set(line.senderUserId, line.user);
          }
          return {
            id: String(line.id),
            role: isHost ? "owner" : "viewer",
            user: line.user,
            text: line.text,
            isHost,
            ...(line.avatarHref ? { avatarHref: line.avatarHref } : {}),
            ...(line.subtitle ? { subtitle: line.subtitle } : {}),
            ...(line.sentAtMs != null ? { sentAtMs: line.sentAtMs } : {}),
          };
        });
        setChatMessages(mapped);
        setChatHistoryStatus("ready");
      } catch {
        if (!cancelled) {
          setChatHistoryStatus("failed");
          setChatMessages([]);
        }
      }

      if (cancelled) return;

      setStudioSocketHint("Chat ulanmoqda…");
      const ws = new WebSocket(buildStreamWsUrl(WS_URL, sid));
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled || wsRef.current !== ws) return;
        setStudioSocketHint(null);
        const uid = getStoredStreamUserId();
        const username = myDisplayNameRef.current;
        ws.send(
          JSON.stringify({
            action: "viewer",
            streamId: sid,
            ...(uid != null ? { userId: uid } : {}),
            ...(username ? { username, senderName: username, displayName: username } : {}),
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const rawStr = event.data;
          if (typeof rawStr !== "string") return;
          const data = JSON.parse(rawStr) as Record<string, unknown>;
          const act = typeof data.action === "string" ? data.action.toLowerCase() : "";
          if (act === "error" || act === "streamerror" || act === "stream_not_found") {
            setError(
              (typeof data.message === "string" && data.message) ||
                (typeof data.error === "string" && data.error) ||
                "Chat server xatoligi"
            );
            return;
          }
          if (data.action === "liveUserCount" && typeof data.liveUserCount === "number") {
            setLiveUserCount(data.liveUserCount);
            return;
          }
          const payload = flattenStreamChatWsPayload(data);
          const line = parseStreamChatInbound(payload);
          if (line) {
            if (/stream\s+not\s+found\b/i.test(line.text.trim())) {
              setError(line.text.trim());
              return;
            }
            if (pendingSentTexts.current.has(line.text.trim())) {
              pendingSentTexts.current.delete(line.text.trim());
              return;
            }
            const hostIdWs = getStoredStreamUserId();
            const myName = myDisplayNameRef.current;
            const isMe = hostIdWs != null && line.senderUserId != null && line.senderUserId === hostIdWs;
            const isHost = isMe || inferLineIsStreamHost(line, hostIdWs ?? undefined);
            const nameIsUnknown = line.user === "viewer" || line.user.startsWith("user_");
            const cachedName = line.senderUserId != null ? userNameCache.current.get(line.senderUserId) : undefined;
            const resolvedUser = isMe ? myName : nameIsUnknown && cachedName ? cachedName : line.user;
            if (line.senderUserId != null && !nameIsUnknown) {
              userNameCache.current.set(line.senderUserId, line.user);
            }
            const idStr = String(line.id);
            setChatMessages((prev) => {
              if (prev.some((x) => String(x.id) === idStr)) return prev;
              return [
                ...prev,
                {
                  id: idStr,
                  role: isHost ? "owner" : "viewer",
                  user: resolvedUser,
                  text: line.text,
                  isHost,
                  isMe,
                  ...(line.avatarHref ? { avatarHref: line.avatarHref } : {}),
                  ...(line.subtitle ? { subtitle: line.subtitle } : {}),
                  ...(line.sentAtMs != null ? { sentAtMs: line.sentAtMs } : {}),
                },
              ];
            });
          }
        } catch {
          /* ignore */
        }
      };

      ws.onerror = () => {
        if (!cancelled && wsRef.current === ws) {
          setStudioSocketHint(null);
          setChatPanelError("Chat socket ulanishida xatolik.");
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
      };
    };

    void run();

    return () => {
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [streamId]);

  useEffect(() => {
    if (!streamId || !hlsUrl || !videoRef.current) return;
    const video = videoRef.current;
    setHlsPlaying(false);

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    const nextFallback = () => {
      setHlsPlaying(false);
      setHlsIndex((prev) => (prev + 1 < hlsCandidates.length ? prev + 1 : prev));
    };

    cleanup();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      video.onloadeddata = () => setHlsPlaying(true);
      video.onerror = nextFallback;
      void video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls({ manifestLoadingTimeOut: 10000, manifestLoadingMaxRetry: 2 });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setHlsPlaying(true);
        void video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, d) => {
        if (d.fatal) nextFallback();
      });
    } else {
      nextFallback();
    }

    return () => {
      video.onloadeddata = null;
      video.onerror = null;
      cleanup();
    };
  }, [streamId, hlsUrl, hlsCandidates.length]);

  const studioChatItems = useMemo((): StudioChatItem[] => {
    return chatMessages.map((m) => {
      const displayUser = m.isMe ? myDisplayName : m.user;
      const time = formatChatClock(m.sentAtMs) || "";
      const badge = m.isHost ? "👑" : m.isMe ? "🟦" : "◇";
      const color =
        m.role === "owner"
          ? "text-cyan-400"
          : m.role === "moderator"
            ? "text-fuchsia-400"
            : chatUsernameColorClass(displayUser);
      return {
        id: m.id,
        user: displayUser,
        text: m.text,
        badge,
        color,
        time,
        isHost: m.isHost,
        ...(m.avatarHref ? { avatarHref: m.avatarHref } : {}),
      };
    });
  }, [chatMessages, myDisplayName]);

  const isWaiting = status === "waiting";
  const isLive = status === "live";

  const viewerWatchUrl = useMemo(() => {
    if (!streamId) return "";
    if (typeof window === "undefined") return `/videos/efirlar/${encodeURIComponent(streamId)}`;
    return `${window.location.origin}/videos/efirlar/${encodeURIComponent(streamId)}`;
  }, [streamId]);

  const copyWatchUrl = useCallback(async () => {
    if (!viewerWatchUrl) return;
    try {
      await navigator.clipboard.writeText(viewerWatchUrl);
      setWatchCopied(true);
      window.setTimeout(() => setWatchCopied(false), 2000);
    } catch {
      /* clipboard */
    }
  }, [viewerWatchUrl]);

  const profileAvatar = useMemo(() => {
    const p = profileData as Record<string, unknown> | null | undefined;
    const fromRow = (r: Record<string, unknown> | null | undefined) => {
      if (!r) return "";
      if (typeof r.avatar === "string" && r.avatar.trim()) return r.avatar.trim();
      if (typeof r.avatarUrl === "string" && r.avatarUrl.trim()) return r.avatarUrl.trim();
      const att = r.attachmentResponseDTO as Record<string, unknown> | undefined;
      if (att && typeof att === "object") {
        const u = att.preSignedUrl ?? att.contentURL ?? att.pre_signed_url;
        if (typeof u === "string" && u.trim()) return u.trim();
      }
      return "";
    };
    const fromStore = () => {
      const u = storeUser;
      if (!u) return "";
      if (typeof u.avatar === "string" && u.avatar.trim()) return u.avatar.trim();
      const a = u.attachmentResponseDTO;
      if (a?.preSignedUrl?.trim()) return a.preSignedUrl.trim();
      if (a?.contentURL?.trim()) return a.contentURL.trim();
      return "";
    };
    return fromRow(p) || fromStore();
  }, [profileData, storeUser]);

  const profileAvatarSrc = useMemo(() => {
    if (!profileAvatar) return "";
    return profileAvatar.startsWith("http") || profileAvatar.startsWith("data:") ? profileAvatar : cdnUrl(profileAvatar);
  }, [profileAvatar]);

  const profileRow = profileData as Record<string, unknown> | null | undefined;
  const profileNumericId = (() => {
    const raw = profileRow?.id;
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw);
    return profileUserId ?? null;
  })();
  const profileBio =
    profileRow && typeof profileRow.bio === "string" && profileRow.bio.trim()
      ? profileRow.bio.trim()
      : "";
  const showProfileAvatarSkeleton = Boolean(profileUserId) && profilePending && !profileAvatarSrc;

  const controller: StreamStudioController = {
    profileUserId,
    profileData,
    profilePending,
    myDisplayName,
    setMyDisplayName,
    title,
    setTitle,
    game,
    setGame,
    status,
    streamId,
    streamKey,
    liveUserCount,
    busy,
    error,
    setError,
    ownerMessage,
    setOwnerMessage,
    studioSocketHint,
    chatHistoryStatus,
    chatPanelError,
    setChatPanelError,
    watchCopied,
    hlsPlaying,
    overlayText,
    setOverlayText,
    videoRef,
    serverUrl,
    createStream,
    stopStream,
    startLive,
    regenerateKey,
    sendChat,
    copyWatchUrl,
    studioChatItems,
    isWaiting,
    isLive,
    viewerWatchUrl,
    profileAvatarSrc,
    profileNumericId,
    profileBio,
    showProfileAvatarSkeleton,
    settingsOpen,
    setSettingsOpen,
    overlayImages,
    setOverlayImages,
    pinnedMessage,
    setPinnedMessage,
    hashtags,
    setHashtags,
    tagInput,
    setTagInput,
  };

  return {
    ...controller,
    streamPutPathId,
    hlsUrl,
    hlsCandidates,
    hlsIndex,
  };
}
