"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios, { type AxiosError } from "axios";
import Hls from "hls.js";
import { useRouter } from "next/navigation";
import { BASE_URL, WS_URL } from "@/lib/constants";
import {
  getStoredStreamUserId,
  inferLineIsStreamHost,
  parseStreamChatInbound,
} from "@/lib/streamChat";
import { fetchStreamChatHistory } from "@/lib/streamChatHistory";
import { chatUsernameColorClass, StreamChatPanel } from "@/components/stream/StreamChatPanel";
import { buildStreamWsUrl } from "@/lib/streamWs";
import { deriveStreamRestPathId, pickStreamEntityId } from "@/lib/streamIds";
import { Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

type StreamStatus = "offline" | "waiting" | "live";
type CopyStatus = "idle" | "copied" | "manual" | "failed";

type ChatRole = "viewer" | "owner" | "moderator";
interface ChatMessage {
  id: string;
  role: ChatRole;
  user: string;
  text: string;
  badge?: string;
  /** Strim egasi (akkaunt/strim javobi asosida). */
  isHost?: boolean;
  /** Hozirgi user (studio egasi) yozgan xabar. */
  isMe?: boolean;
}

interface StreamDto {
  id: string;
  /** `PUT /streams/{...}` uchun — odatda raqamli PK; boʻlmasa `id` bilan bir xil */
  restPathId: string;
  name?: string;
  isLive?: boolean;
  url?: string;
  fileId?: number;
  clickCount?: number;
}

/** Backend `{ id }`, `{ data: {...} }`, UUID `streamId` / `streamUuid` — WS: `{WS_URL}/scws/{id}`. */
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

/** POST `/streams/create` — backend kontrakt (Zafar Bek). */
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

interface FieldBoxProps {
  label: string;
  value: string;
  secret?: boolean;
}

interface CardProps {
  children: React.ReactNode;
  green?: boolean;
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

function FieldBox({ label, value, secret = false }: FieldBoxProps) {
  const [show, setShow] = useState(!secret);
  const [status, setStatus] = useState<CopyStatus>("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayValue = secret && !show ? "••••••••••••••••••••••••••••••" : value;

  const handleCopy = async () => {
    const result = await safeCopyText(value, inputRef.current);
    setStatus(result);
    window.setTimeout(() => setStatus("idle"), 1300);
  };

  return (
    <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.22)", padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase" }}>{label}</p>
        {secret && (
          <button type="button" onClick={() => setShow((v) => !v)} style={{ border: 0, background: "transparent", color: "#34f5a5", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
            {show ? "Yashirish" : "Ko'rsatish"}
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 88px", gap: 10 }}>
        <input ref={inputRef} readOnly value={displayValue} style={{ minWidth: 0, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,.1)", background: "#0f1011", color: "white", padding: "0 12px", outline: "none" }} />
        <button type="button" onClick={handleCopy} style={{ border: 0, borderRadius: 12, background: "#00d997", color: "#00150d", fontWeight: 900, cursor: "pointer" }}>
          {status === "copied" ? "Copied" : status === "manual" ? "Select" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function Card({ children, green = false }: CardProps) {
  return (
    <section
      style={{
        borderRadius: 24,
        border: green ? "1px solid rgba(0,217,151,.35)" : "1px solid rgba(255,255,255,.1)",
        background: green ? "rgba(0,217,151,.08)" : "rgba(255,255,255,.045)",
        padding: 20,
      }}
    >
      {children}
    </section>
  );
}

export default function StreamStudioPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("PUBG Mobile turnir — jonli efir");
  const [game, setGame] = useState("PUBG MOBILE");
  const [status, setStatus] = useState<StreamStatus>("offline");
  const [streamId, setStreamId] = useState<string | null>(null);
  /** `PUT /streams/{id}` — backend PK (raqam) bo'lishi mumkin; WS/HLS uchun `streamId` */
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
  const [hlsIndex, setHlsIndex] = useState(0);
  const [hlsPlaying, setHlsPlaying] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

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
        // Backend da stream yo'q — localStorage ni tozalab offline ga qayt
        clearState();
        setStreamId(null);
        setStreamPutPathId(null);
        setStreamKey("");
        setStatus("offline");
      }
    } catch {
      // Network xato — localStorage state saqlansin
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
      // Mavjud stream ni tekshir — backend da bor bo'lsa ishlatamiz
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
      } else setError("Server stream id qaytarmadi. Javob formatini tekshiring.");
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
    // createStreamV2 allaqachon isLive:true qo'yadi — PUT kerak emas
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
    const userId = getStoredStreamUserId();
    if (userId == null) {
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
    wsRef.current.send(JSON.stringify({ action: "streamChatMessage", streamId, userId, message: msg }));
    // Xabar websocket orqali qaytadi — dublikatlardan qochish
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

  /** Avval REST chat tarixi, keyin websocket (tomoshabin sahifasi bilan bir xil). */
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
          return {
            id: String(line.id),
            role: isHost ? "owner" : "viewer",
            user: line.user,
            text: line.text,
            isHost,
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
        ws.send(JSON.stringify({ action: "viewer", streamId: sid }));
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
          let payload = data;
          if (
            data.action === "streamChatMessage" &&
            typeof data.payload === "object" &&
            data.payload !== null
          ) {
            payload = data.payload as Record<string, unknown>;
          }
          const line = parseStreamChatInbound(payload);
          if (line) {
            if (/stream\s+not\s+found\b/i.test(line.text.trim())) {
              setError(line.text.trim());
              return;
            }
            const hostIdWs = getStoredStreamUserId();
            const isHost = inferLineIsStreamHost(line, hostIdWs ?? undefined);
            const idStr = String(line.id);
            setChatMessages((prev) => {
              if (prev.some((x) => String(x.id) === idStr)) return prev;
              return [
                ...prev,
                {
                  id: line.id,
                  role: isHost ? "owner" : "viewer",
                  user: line.user,
                  text: line.text,
                  isHost,
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

  const studioPanelMessages = useMemo(
    () =>
      chatMessages.map((m) => ({
        id: m.id,
        user: m.user,
        text: m.text,
        userColorClass:
          m.role === "owner"
            ? "text-[#34f5a5]"
            : m.role === "moderator"
              ? "text-[#a78bfa]"
              : chatUsernameColorClass(m.user),
        isHost: m.isHost,
        isMe: m.role === "owner",
        badge: m.badge,
      })),
    [chatMessages]
  );

  const isWaiting = status === "waiting";
  const isLive = status === "live";

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        background:
          "radial-gradient(1100px 520px at 6% -6%, rgba(0, 217, 151, 0.09), transparent 62%), radial-gradient(900px 460px at 98% 0%, rgba(62, 166, 255, 0.06), transparent 60%), linear-gradient(180deg, #0b0d0e 0%, #090b0c 100%)",
      }}
    >
      <div style={{ padding: "24px 28px 88px" }}>
        <header style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.035)", padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>Stream Studio</h1>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,.58)", fontSize: 13 }}>OBS uchun Stream URL va Stream Key oling</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button type="button" disabled={busy} onClick={createStream} style={{ height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.055)", color: "white", padding: "0 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Yaratilmoqda..." : "Stream yaratish"}
              </button>
              {streamId ? (
                <>
                  {!isLive ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={startLive}
                      style={{ height: 40, borderRadius: 8, border: 0, background: "#00d997", color: "#00150d", padding: "0 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                    >
                      Jonli boshlash
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void stopStream()}
                    style={{ height: 40, borderRadius: 8, border: 0, background: "#ef4444", color: "white", padding: "0 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
                  >
                    {isLive ? "Streamni to'xtatish" : "Strimni yopish"}
                  </button>
                </>
              ) : null}
            </div>
          </div>
          {error && <p style={{ margin: "8px 0 0", color: "#fecaca", fontSize: 12, fontWeight: 700 }}>{error}</p>}
        </header>

        <div
          className="stream-layout"
          style={{
            display: "grid",
            gap: 24,
            borderRadius: 26,
            border: "1px solid rgba(255,255,255,.16)",
            background: "rgba(255,255,255,.02)",
            padding: 10,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,.35), 0 18px 44px rgba(0,0,0,.35)",
          }}
        >
          <main style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 24 }}>
            <section style={{ overflow: "hidden", borderRadius: 18, border: "1px solid rgba(255,255,255,.2)", background: "#111315", boxShadow: "0 0 0 1px rgba(0,0,0,.45) inset" }}>
              <div style={{ position: "relative", minHeight: 560, background: "radial-gradient(circle at 50% 35%, rgba(255,255,255,.16), transparent 28%), linear-gradient(135deg, rgba(16,185,129,.28), #18231d 45%, #000 100%)" }}>
                <div style={{ position: "absolute", top: 22, left: 22, display: "flex", gap: 10, flexWrap: "wrap", zIndex: 2 }}>
                  <span style={{ borderRadius: 999, padding: "7px 12px", background: isLive ? "#ef4444" : isWaiting ? "#facc15" : "rgba(255,255,255,.1)", color: isWaiting ? "#111" : "white", fontSize: 12, fontWeight: 900 }}>
                    {isLive ? "● JONLI" : isWaiting ? "OBS SIGNAL KUTILYAPTI" : "OFFLINE"}
                  </span>
                  <span style={{ borderRadius: 999, padding: "7px 12px", background: "rgba(0,0,0,.45)", color: "rgba(255,255,255,.82)", fontSize: 12, fontWeight: 800 }}>1080p / 60fps</span>
                </div>
                {isLive && (
                  <div
                    style={{
                      position: "absolute",
                      top: 22,
                      right: 22,
                      zIndex: 2,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 999,
                      padding: "7px 12px",
                      background: "rgba(0,0,0,.45)",
                      border: "1px solid rgba(255,255,255,.12)",
                      color: "white",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    <Users size={14} />
                    <span>{liveUserCount}</span>
                  </div>
                )}

                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 30, textAlign: "center" }}>
                  {streamId ? (
                    <div style={{ position: "absolute", inset: 2, borderRadius: 16, overflow: "hidden" }}>
                      <div style={{ position: "relative", width: "100%", height: "100%" }}>
                        <video ref={videoRef} controls autoPlay muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "#000", objectFit: "cover" }} />
                        {!hlsPlaying && (
                          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(3,5,7,.7)" }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: 900, fontSize: 18 }}>Stream signali kutilmoqda...</p>
                              <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.7)", fontSize: 14 }}>OBS dan `Start Streaming` bosing. HLS odatda 5-10 soniyada chiqadi.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ maxWidth: 900 }}>
                      <div style={{ margin: "0 auto 24px", width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(255,255,255,.16)", background: "rgba(0,0,0,.35)", display: "grid", placeItems: "center", fontSize: 46 }}>
                        {isLive ? "▶" : isWaiting ? "⏳" : "📺"}
                      </div>
                      <p style={{ margin: "8px auto 0", color: "rgba(255,255,255,.58)", lineHeight: "28px", fontSize: 15, maxWidth: 650 }}>OBS ichida Server va Stream Key ni qo'ying. OBS dan signal kelgach streamni jonli efirga chiqarishingiz mumkin.</p>
                    </div>
                  )}
                </div>

              </div>
            </section>

            <Card>
              <h3 style={{ margin: "0 0 16px", fontSize: 21, fontWeight: 900 }}>Stream ma'lumotlari</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18 }}>
                <label style={{ minWidth: 0 }}>
                  <span style={{ display: "block", marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,.65)", fontWeight: 800 }}>Stream nomi</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", height: 50, borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.25)", color: "white", padding: "0 14px", outline: "none" }} />
                </label>
                <label style={{ minWidth: 0 }}>
                  <span style={{ display: "block", marginBottom: 8, fontSize: 13, color: "rgba(255,255,255,.65)", fontWeight: 800 }}>O'yin / kategoriya</span>
                  <select value={game} onChange={(e) => setGame(e.target.value)} style={{ width: "100%", height: 50, borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.25)", color: "white", padding: "0 14px", outline: "none" }}>
                    <option>PUBG MOBILE</option><option>FREE FIRE</option><option>MOBILE LEGENDS</option><option>STEAM</option><option>BOSHQA</option>
                  </select>
                </label>
              </div>
              {streamId ? (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 700, lineHeight: 1.4 }}>
                    Chat WebSocket (<code>NEXT_PUBLIC_WS_URL</code>):{" "}
                    <code style={{ color: "#34f5a5", wordBreak: "break-all" }}>{buildStreamWsUrl(WS_URL, streamId)}</code>
                  </p>
                  <FieldBox label="Stream ID (`/streams/create` javobi)" value={streamId} />
                  <FieldBox
                    label="Tomoshiba havolasi (shu id URLda)"
                    value={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/videos/efirlar/${encodeURIComponent(streamId)}`
                        : `/videos/efirlar/${encodeURIComponent(streamId)}`
                    }
                  />
                </div>
              ) : null}
            </Card>

            <Card green>
              <h3 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 900 }}>OBS sozlamalari</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <FieldBox label="Stream URL / Server" value={serverUrl} />
                <FieldBox label="Stream Key" value={streamKey} secret />
              </div>
              <button type="button" onClick={regenerateKey} disabled={busy} style={{ width: "100%", height: 48, marginTop: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.25)", color: "white", fontWeight: 900, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                Yangi stream key olish
              </button>
            </Card>
          </main>

          <aside className="w-full min-w-0 box-border flex flex-col">
            <StreamChatPanel
              className=""
              liveUserCount={liveUserCount}
              socketHint={studioSocketHint}
              chatHistoryStatus={chatHistoryStatus}
              messages={studioPanelMessages}
              chatInput={ownerMessage}
              onChatInputChange={(v) => {
                setOwnerMessage(v);
                if (chatPanelError) setChatPanelError(null);
              }}
              onSend={() => sendChat("owner", ownerMessage)}
              chatError={chatPanelError}
              onChatErrorDismiss={() => setChatPanelError(null)}
              pinnedRank="7"
              pinnedTitle="WITH AN ADDON CALLED UL..."
              inputPlaceholder="Xabar yozing…"
              emptyHint={
                streamId ? "Hozircha xabar yo‘q. Tomoshabinlar yozishi yoki tarix yuklanishi mumkin." : "Avval stream yarating — chat shu yerda ko‘rinadi."
              }
              loadingHint="Chat tarixi yuklanmoqda…"
              welcomeFooter={
                <div>
                  <p className="m-0 text-[14px] font-semibold leading-relaxed text-white">
                    Chatga xush kelibsiz! Maxfiylik va jamiyat qoidalariga rioya qiling.
                  </p>
                  <button type="button" className="mt-3 border-0 bg-transparent p-0 text-[13px] font-bold text-[#3ea6ff] hover:underline">
                    Batafsil
                  </button>
                </div>
              }
            />
          </aside>
        </div>
      </div>

      <style jsx>{`
        .stream-layout { grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 1180px) {
          .stream-layout { grid-template-columns: minmax(0, 1fr) 430px; align-items: start; column-gap: 0; }
        }
      `}</style>
    </div>
  );
}

