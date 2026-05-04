"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { type AxiosError } from "axios";
import Hls from "hls.js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BASE_URL, WS_URL } from "@/lib/constants";
import {
  getStoredStreamUserId,
  inferLineIsStreamHost,
  parseStreamChatInbound,
  flattenStreamChatWsPayload,
} from "@/lib/streamChat";
import { fetchStreamChatHistory } from "@/lib/streamChatHistory";
import { StudioChatPanel, type StudioChatItem } from "@/components/stream/StudioChatPanel";
import { chatUsernameColorClass } from "@/components/stream/StreamChatPanel";
import { buildStreamWsUrl } from "@/lib/streamWs";
import { deriveStreamRestPathId, pickStreamEntityId } from "@/lib/streamIds";
import {
  ArrowLeft,
  Check,
  Copy,
  Edit3,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Send,
  Shield,
  Tv,
  User,
  Users,
  Users2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "@/hooks/useProfile";
import { cdnUrl } from "@/lib/utils";

/* ─── Types ─── */

type StreamStatus = "offline" | "waiting" | "live";
type CopyStatus = "idle" | "copied" | "manual" | "failed";

type ChatRole = "viewer" | "owner" | "moderator";
interface ChatMessage {
  id: string;
  role: ChatRole;
  user: string;
  text: string;
  badge?: string;
  isHost?: boolean;
  isMe?: boolean;
  avatarHref?: string;
  subtitle?: string;
  /** Xabar vaqti (ms) — tarix/WS dan. */
  sentAtMs?: number;
}

function formatChatClock(ms: number | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false });
}

interface StreamDto {
  id: string;
  restPathId: string;
  name?: string;
  isLive?: boolean;
  url?: string;
  fileId?: number;
  clickCount?: number;
}

/* ─── Helpers ─── */

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

async function safeCopyText(value: string, inputElement: HTMLInputElement | null): Promise<CopyStatus> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return "copied";
    }
  } catch {}

  if (inputElement) {
    inputElement.focus();
    inputElement.select();
    inputElement.setSelectionRange?.(0, inputElement.value.length);
    return "manual";
  }
  return "failed";
}

/* ─── UI Components ─── */

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    const result = await safeCopyText(value, inputRef.current);
    if (result === "copied" || result === "manual") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group flex min-w-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          readOnly
          value={value}
          className="box-border h-11 w-full min-w-0 rounded-md border border-white/[0.06] bg-[#0e0e10] px-3.5 text-sm font-mono text-[#adadb8] outline-none transition focus:border-[#9147ff]/20"
        />
      </div>
      <button
        onClick={handleCopy}
        className={`box-border flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition ${
          copied
            ? "border-[#00d26a]/30 bg-[#00d26a]/10 text-[#00d26a]"
            : "border-white/[0.06] text-[#5c5c6d] hover:text-[#adadb8]"
        }`}
        title={label || "Nusxalash"}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

function SecretCopyField({ value, label }: { value: string; label: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const display = show ? value : "•".repeat(Math.min(Math.max(value.length || 12, 12), 24));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard */
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[#5c5c6d]">{label}</label>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="shrink-0 text-xs text-[#9147ff]/80 transition hover:text-[#9147ff]"
        >
          {show ? "Yashirish" : "Ko'rsatish"}
        </button>
      </div>
      <div className="group flex min-w-0 items-center gap-2">
        <input
          readOnly
          value={display}
          className="box-border h-11 min-h-0 min-w-0 flex-1 rounded-md border border-white/[0.06] bg-[#0e0e10] px-3.5 font-mono text-sm text-[#adadb8] outline-none"
        />
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`box-border flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition ${
            copied
              ? "border-[#00d26a]/30 bg-[#00d26a]/10 text-[#00d26a]"
              : "border-white/[0.06] text-[#5c5c6d] hover:text-[#adadb8]"
          }`}
          title="Nusxalash"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */

export default function StreamStudioPage() {
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
  const { data: profileData } = useProfile(profileUserId);

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
    const username = typeof p.username === "string" ? p.username.trim() : "";
    if (username) {
      localStorage.setItem("quvna_stream_username", username);
      setMyDisplayName(username);
      return;
    }
    const fullName = typeof p.fullName === "string" ? p.fullName.trim() : "";
    if (fullName) setMyDisplayName(fullName);
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

  const [overlayText, setOverlayText] = useState("Salom do'stlar! Bugun PUBG Mobile turnir finalini jonli efirda kuzatamiz 🎮🔥");

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const pendingSentTexts = useRef<Set<string>>(new Set());
  const userNameCache = useRef<Map<number, string>>(new Map());
  const myDisplayNameRef = useRef(myDisplayName);

  useEffect(() => {
    myDisplayNameRef.current = myDisplayName;
    setChatMessages((prev) => prev.map((m) => (m.isMe ? { ...m, user: myDisplayName } : m)));
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
      // Network xato
    }
  };

  const createStream = async () => {
    if (busy) return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Login qilinmagan. Avval akkauntga kiring.");
      router.push("/auth/login");
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
        router.push("/auth/login");
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
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Login qilinmagan. Login sahifasiga yo'naltirilmoqda...");
      router.push("/auth/login");
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
      } catch {}
    }
    loadExistingStream();
  }, [router]);

  useEffect(() => {
    setHlsIndex(0);
    setHlsPlaying(false);
  }, [streamId]);

  useEffect(() => {
    const sid = streamId?.trim();
    if (!sid) {
      setStudioSocketHint(null);
      setChatHistoryStatus("ready");
      setChatMessages([]);
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
      const time = formatChatClock(m.sentAtMs) || "—";
      const badge = m.isMe ? "🟦" : m.isHost ? "👑" : "◻";
      const color =
        m.role === "owner"
          ? "text-cyan-400"
          : m.role === "moderator"
            ? "text-fuchsia-400"
            : chatUsernameColorClass(displayUser);
      return { id: m.id, user: displayUser, text: m.text, badge, color, time };
    });
  }, [chatMessages, myDisplayName]);

  const isWaiting = status === "waiting";
  const isLive = status === "live";
  const pinnedChatTitle = title.trim();

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
    if (!p) return "";
    if (typeof p.avatar === "string" && p.avatar.trim()) return p.avatar.trim();
    if (typeof p.avatarUrl === "string" && p.avatarUrl.trim()) return p.avatarUrl.trim();
    const att = p.attachmentResponseDTO as Record<string, unknown> | undefined;
    if (att && typeof att === "object") {
      const u = att.preSignedUrl ?? att.contentURL ?? att.pre_signed_url;
      if (typeof u === "string" && u.trim()) return u.trim();
    }
    return "";
  }, [profileData]);

  const profileAvatarSrc = useMemo(() => {
    if (!profileAvatar) return "";
    return profileAvatar.startsWith("http") || profileAvatar.startsWith("data:") ? profileAvatar : cdnUrl(profileAvatar);
  }, [profileAvatar]);

  return (
    <div data-stream-studio-page className="flex min-h-screen flex-col bg-[#0e0e10] text-[#efeff1] antialiased">
      {/* ===== TWITCH-STYLE HEADER ===== */}
      <header className="sticky top-0 z-50 h-12 shrink-0 border-b border-white/[0.06] bg-[#0e0e10]/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/videos"
              className="flex shrink-0 items-center gap-1.5 rounded-md py-1 pl-0.5 pr-2 text-xs font-medium text-[#adadb8] transition hover:text-white"
            >
              <ArrowLeft size={14} aria-hidden />
              Efirlar
            </Link>
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#00d26a] text-[#0e0e10]">
              <Send size={14} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold tracking-tight">Creator Studio</span>
            <span className="text-white/10">|</span>
            <span className="text-xs text-[#adadb8]">Jonli efir</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#1f1f23] px-2.5 py-1 text-[11px] font-medium text-[#adadb8]">
              <span
                className={`h-1.5 w-1.5 rounded-full motion-reduce:animate-none ${isLive ? "animate-pulse bg-red-500" : isWaiting ? "bg-amber-500" : "bg-[#5c5c6d]"}`}
              />
              {isLive ? "LIVE" : isWaiting ? "OBS kutish" : "Offline"}
            </span>
            {!streamId ? (
              <button
                disabled={busy}
                onClick={createStream}
                className="h-7 rounded border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-[#adadb8] transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              >
                {busy ? "Yaratilmoqda…" : "Yaratish"}
              </button>
            ) : (
              <>
                {!isLive && (
                  <button
                    disabled={busy}
                    onClick={startLive}
                    className="h-7 rounded bg-[#00d26a] px-3 text-xs font-bold text-[#0e0e10] transition hover:bg-[#00e075] disabled:opacity-50"
                  >
                    Jonli boshlash
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => void stopStream()}
                  className="h-7 rounded border border-red-500/20 bg-red-500/10 px-3 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {isLive ? "To'xtatish" : "Yopish"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sahifa natural scroll — video+chat to'liq ekran, pastki detallar oddiy oqim */}
      <div className="mx-auto w-full max-w-[1800px]">
        <main className="flex min-w-0 flex-col">
          {/* Video + Chat qatori — to'liq viewport balandligi */}
          <div className="flex w-full items-stretch" style={{ height: "calc(100vh - 48px)", minHeight: 480 }}>
            <div className="relative min-h-0 min-w-0 flex-1 bg-black">
            {streamId ? (
              <>
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
                {!hlsPlaying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
                      <Loader2 size={26} className="animate-spin text-white/20" />
                    </div>
                    <p className="text-sm font-medium text-[#5c5c6d]">Предпросмотр трансляции</p>
                    <p className="mt-1 text-xs text-[#3d3d44]">НЕ В СЕТИ</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
                  <Tv size={26} className="text-white/20" />
                </div>
                <p className="text-sm font-medium text-[#5c5c6d]">Предпросмотр трансляции</p>
                <p className="mt-1 text-xs text-[#3d3d44]">НЕ В СЕТИ</p>
              </div>
            )}

            {/* Top status badge */}
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
              {isLive ? (
                <div className="flex items-center gap-1.5 rounded bg-[#1f1f23]/90 px-2 py-1 text-[11px] font-semibold text-red-400 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" />
                  LIVE
                </div>
              ) : isWaiting ? (
                <div className="flex items-center gap-1.5 rounded bg-[#1f1f23]/90 px-2 py-1 text-[11px] font-semibold text-amber-400 backdrop-blur-sm">
                  <Loader2 size={11} className="animate-spin" />
                  НЕ В СЕТИ
                </div>
              ) : (
                <div className="rounded bg-[#1f1f23]/90 px-2 py-1 text-[11px] font-semibold text-[#5c5c6d] backdrop-blur-sm">
                  НЕ В СЕТИ
                </div>
              )}
            </div>

            {/* Viewers count */}
            {isLive && (
              <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded bg-[#1f1f23]/90 px-2 py-1 backdrop-blur-sm">
                <Users size={12} className="text-[#00d26a]" />
                <span className="text-[11px] font-bold tabular-nums text-white">{liveUserCount}</span>
              </div>
            )}
          </div>

            <aside className="sticky top-[48px] flex w-[clamp(340px,26vw,460px)] shrink-0 flex-col overflow-hidden border-l border-white/[0.06] 2xl:w-[480px]" style={{ height: "calc(100vh - 48px)" }}>
              <StudioChatPanel
                className="h-full min-h-0 w-full flex-1"
                items={studioChatItems}
                chatInput={ownerMessage}
                onChatInputChange={(v) => {
                  setOwnerMessage(v);
                  if (chatPanelError) setChatPanelError(null);
                }}
                onSend={() => sendChat("owner", ownerMessage)}
                pinnedText={pinnedChatTitle}
                liveUserCount={liveUserCount}
                chatError={chatPanelError}
                onDismissError={() => setChatPanelError(null)}
                socketHint={studioSocketHint}
                chatHistoryStatus={chatHistoryStatus}
                emptyHint={streamId ? "Hozircha xabar yo'q." : "Avval stream yarating."}
              />
            </aside>
          </div>

          <div>
          {/* STREAMER INFO BAR */}
          <div className="box-border flex min-w-0 items-center border-b border-white/[0.06] bg-[#18181b] px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex min-w-0 flex-1 items-start gap-5">
              <div className="relative shrink-0 pt-0.5">
                <div className="h-11 w-11 overflow-hidden rounded-full border border-[#00d26a]/30 bg-[#2d2d35]">
                  {profileAvatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profileAvatarSrc} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User size={20} className="text-[#00d26a]/60" />
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-[#18181b] bg-[#00d26a]" />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-lg font-bold leading-tight tracking-tight text-white">{myDisplayName}</span>
                  <span className="rounded-md bg-[#00d26a]/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-[#00d26a]">
                    СТРИМЕР
                  </span>
                </div>
                {overlayText ? (
                  <p className="line-clamp-3 text-[15px] leading-relaxed text-[#adadb8]">{overlayText}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS — ikki qator (ml-auto siqilish bermaydi) */}
          <div className="box-border border-b border-white/[0.06] bg-[#18181b] px-5 py-4 sm:px-7">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setTitle((t) => t)}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#9147ff] px-4 text-sm font-semibold text-white hover:bg-[#a970ff]"
                >
                  <Edit3 size={15} />
                  Tahrirlash
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1f1f23] px-4 text-sm font-medium text-[#adadb8] hover:bg-[#26262c] hover:text-white">
                  <Shield size={15} />
                  Sozlamalar
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1f1f23] px-4 text-sm font-medium text-[#adadb8] hover:bg-[#26262c] hover:text-white">
                  <Users2 size={15} />
                  Moderatsiya
                </button>
              </div>
              <div className="flex shrink-0 items-center gap-2.5 sm:pl-4">
                <button
                  onClick={() => void copyWatchUrl()}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1f1f23] px-4 text-sm font-medium text-[#adadb8] hover:bg-[#26262c] hover:text-white"
                >
                  {watchCopied ? <Check size={15} className="text-[#00d26a]" /> : <Link2 size={15} />}
                  Havola
                </button>
                <a
                  href={viewerWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#1f1f23] text-[#adadb8] hover:bg-[#26262c] hover:text-white"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>

          {/* OVERLAY TEXT */}
          <div className="box-border border-b border-white/[0.06] bg-[#18181b] px-5 py-5 sm:px-7">
            <div className="relative min-w-0">
              <input
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                maxLength={120}
                placeholder="Tomoshabinlar ko'radigan matn..."
                className="box-border h-11 w-full min-w-0 rounded-md border border-white/[0.06] bg-[#0e0e10] py-2.5 pl-3 pr-16 text-[15px] text-[#efeff1] outline-none transition placeholder:text-[#5c5c6d] focus:border-[#9147ff]/40"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-[#5c5c6d]">
                {overlayText.length}/120
              </span>
            </div>
          </div>

          {/* SETTINGS: tor ekranda 1 ustun — siqilish yo‘q */}
          <div className="grid min-w-0 grid-cols-1 gap-8 border-b border-white/[0.06] bg-[#18181b] px-5 py-6 sm:px-7 sm:py-8 2xl:grid-cols-2 2xl:gap-x-14 2xl:gap-y-8">
            <div className="min-w-0 2xl:border-r 2xl:border-white/[0.06] 2xl:pr-10">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-wide text-[#adadb8]">Stream ma&apos;lumotlari</h4>
              <div className="flex flex-col gap-5">
                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-medium text-[#5c5c6d]">Nomi</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="box-border h-11 w-full min-w-0 rounded-md border border-white/[0.06] bg-[#0e0e10] px-3.5 text-[15px] text-[#efeff1] outline-none focus:border-[#9147ff]/30"
                  />
                </div>
                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-medium text-[#5c5c6d]">Kategoriya</label>
                  <select
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="box-border h-11 w-full min-w-0 rounded-md border border-white/[0.06] bg-[#0e0e10] px-3.5 text-[15px] text-[#efeff1] outline-none"
                  >
                    <option>PUBG MOBILE</option>
                    <option>FREE FIRE</option>
                    <option>MOBILE LEGENDS</option>
                    <option>STEAM</option>
                    <option>BOSHQA</option>
                  </select>
                </div>
                {streamId ? (
                  <div className="min-w-0 pt-1">
                    <label className="mb-2 block text-xs font-medium text-[#5c5c6d]">Stream ID</label>
                    <CopyButton value={streamId} label="Stream ID" />
                  </div>
                ) : null}
              </div>
            </div>
            <div className="min-w-0 2xl:pl-2">
              <h4 className="mb-5 text-xs font-semibold uppercase tracking-wide text-[#adadb8]">OBS</h4>
              <div className="flex flex-col gap-5">
                <div className="min-w-0">
                  <label className="mb-2 block text-xs font-medium text-[#5c5c6d]">Server URL</label>
                  <CopyButton value={serverUrl} />
                </div>
                <div className="min-w-0">
                  <SecretCopyField value={streamKey} label="Stream Key" />
                </div>
              </div>
              <button
                onClick={regenerateKey}
                disabled={busy}
                className="mt-6 inline-flex h-9 items-center gap-2 rounded-md bg-[#1f1f23] px-4 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262c] hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={15} />
                Yangi key
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="border-b border-red-500/10 bg-red-500/5 px-5 py-3 sm:px-7">
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
