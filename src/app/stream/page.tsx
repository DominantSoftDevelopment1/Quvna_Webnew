"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import axios, { type AxiosError } from "axios";
import Hls from "hls.js";
import { useRouter } from "next/navigation";
import { BASE_URL, WS_URL } from "@/lib/constants";
import { PlusCircle, Smile, Users } from "lucide-react";

type StreamStatus = "offline" | "waiting" | "live";
type CopyStatus = "idle" | "copied" | "manual" | "failed";

type ChatRole = "viewer" | "owner" | "moderator";
interface ChatMessage {
  id: string;
  role: ChatRole;
  user: string;
  text: string;
  badge?: string;
}

interface StreamDto {
  id: string;
  name?: string;
  isLive?: boolean;
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

function buildWsUrl(wsBase: string, streamId: string): string {
  return `${wsBase.replace(/\/$/, "")}/scws/${streamId}`;
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

const initialMessages: ChatMessage[] = [
  { id: "m1", role: "viewer", user: "gamer_uz", text: "Salom streamer! Qalesiz?" },
  { id: "m2", role: "viewer", user: "pubg_pro", text: "PUBG oynaysizmi yoki ML?" },
];

export default function StreamStudioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("PUBG Mobile turnir — jonli efir");
  const [game, setGame] = useState("PUBG MOBILE");
  const [status, setStatus] = useState<StreamStatus>("offline");
  const [streamId, setStreamId] = useState<string | null>(null);
  const [streamKey, setStreamKey] = useState("");
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialMessages);
  const [ownerMessage, setOwnerMessage] = useState("");
  const [hlsIndex, setHlsIndex] = useState(0);
  const [hlsPlaying, setHlsPlaying] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const serverUrl = useMemo(() => buildRtmpServerUrl(BASE_URL), []);
  const hlsCandidates = useMemo(() => (streamId ? buildHlsCandidates(streamId) : []), [streamId]);
  const hlsUrl = hlsCandidates[hlsIndex] ?? "";

  const saveState = (id: string, key: string) => {
    localStorage.setItem(persistKey(), JSON.stringify({ id, key }));
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
    setStreamId(stream.id);
    setStreamKey(stream.id);
    saveState(stream.id, stream.id);
    if (stream.name?.trim()) setTitle(stream.name);
    setStatus(forceWaiting ? "waiting" : stream.isLive ? "live" : "waiting");
  };

  const loadExistingStream = async () => {
    try {
      const data = await requestWithFallback<StreamDto | null>("get", "/streams/if-exist/user-stream");
      if (data?.id) {
        applyStream(data);
      } else {
        // Backend da stream yo'q — localStorage ni tozalab offline ga qayt
        clearState();
        setStreamId(null);
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
      const data = await requestWithFallback<StreamDto>("post", "/streams/create", {
        name: title.trim(),
        url: "rtmp",
        fileId: null,
      });
      if (data?.id) applyStream(data, true);
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
    try {
      setBusy(true);
      setError(null);
      await requestWithFallback("put", `/streams/${streamId}`, {
        name: title.trim() || "Quvna Live Stream",
        url: "rtmp",
        isLive: false,
        fileId: null,
      });
      setStatus("offline");
      setStreamId(null);
      setStreamKey("");
      setLiveUserCount(0);
      clearState();
      wsRef.current?.close();
      wsRef.current = null;
    } catch {
      setError("Streamni to'xtatib bo'lmadi.");
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
    setStreamKey("");
    await createStream();
  };

  const sendChat = (role: "owner" | "moderator", text: string) => {
    const msg = text.trim();
    if (!msg) return;
    const userId = Number(localStorage.getItem("userId"));
    if (!Number.isFinite(userId) || userId <= 0) {
      setError("Chat yuborish uchun login qiling.");
      return;
    }
    // UX: tugma bosilganda xabar darhol chatda ko'rinsin
    setChatMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}`,
        role,
        user: role === "owner" ? "siz" : "moderator",
        text: msg,
        badge: role === "moderator" ? "MOD" : undefined,
      },
    ]);

    if (streamId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "streamChatMessage", streamId, userId, message: msg }));
    }
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
        const parsed = JSON.parse(saved) as { id?: string; key?: string };
        if (parsed.id && parsed.key) {
          setStreamId(parsed.id);
          setStreamKey(parsed.key);
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
    if (!streamId) return;
    const ws = new WebSocket(buildWsUrl(WS_URL, streamId));
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ action: "viewer", streamId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, unknown>;
        if (data.action === "liveUserCount" && typeof data.liveUserCount === "number") {
          setLiveUserCount(data.liveUserCount);
          return;
        }
        if (typeof data.message === "string") {
          const u = (data.user as { username?: string; firstName?: string } | undefined) ?? {};
          const messageText = data.message;
          setChatMessages((prev) => [
            ...prev,
            { id: String(data.id ?? `${Date.now()}-${Math.random()}`), role: "viewer", user: u.username || u.firstName || "viewer", text: messageText },
          ]);
        }
      } catch {}
    };

    ws.onerror = () => setError("Chat socket ulanishida xatolik.");
    return () => {
      ws.close();
      if (wsRef.current === ws) wsRef.current = null;
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
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" disabled={busy} onClick={createStream} style={{ height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.055)", color: "white", padding: "0 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Yaratilmoqda..." : "Stream yaratish"}
              </button>
              <button type="button" disabled={busy} onClick={isLive ? stopStream : startLive} style={{ height: 40, borderRadius: 8, border: 0, background: isLive ? "#ef4444" : "#00d997", color: isLive ? "white" : "#00150d", padding: "0 14px", fontSize: 13, fontWeight: 800, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>
                {isLive ? "Streamni to'xtatish" : "Jonli boshlash"}
              </button>
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

          <aside style={{ width: "100%", minWidth: 0, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18 }}>
            <section
              style={{
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.2)",
                background: "linear-gradient(135deg, rgba(16,185,129,.22), #18231d 45%, #000 100%)",
                overflow: "hidden",
                minHeight: 620,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 0 0 1px rgba(0,0,0,.45) inset",
              }}
            >
              <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <button type="button" style={{ border: 0, background: "transparent", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0 }}>
                    Qiziqarli...
                  </button>
                  <span style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", color: "white", fontSize: 12, fontWeight: 700, padding: "5px 10px", whiteSpace: "nowrap" }}>
                    👑 Eng faol muxlislar
                  </span>
                </div>
                <button type="button" aria-label="Menu" style={{ border: 0, background: "transparent", color: "rgba(255,255,255,.75)", fontSize: 20, lineHeight: 1, cursor: "pointer", padding: 0 }}>
                  ⋮
                </button>
              </header>
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {chatMessages.map((m) => (
                  <div key={m.id}>
                    <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ color: m.role === "moderator" ? "#a78bfa" : m.role === "owner" ? "#34f5a5" : "#4cc2ff", fontWeight: 900, fontSize: 14 }}>{m.user}</span>
                      {m.badge && <span style={{ borderRadius: 8, border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.72)", fontSize: 10, fontWeight: 800, padding: "2px 6px" }}>{m.badge}</span>}
                    </p>
                    <p style={{ margin: "3px 0 0", color: "#e8ecff", fontSize: 14 }}>{m.text}</p>
                  </div>
                ))}

                <div style={{ marginTop: "auto", borderRadius: 10, background: "rgba(255,255,255,.08)", padding: 12 }}>
                  <p style={{ margin: 0, color: "white", fontSize: 14, fontWeight: 600, lineHeight: "20px" }}>
                    Chatga xush kelibsiz! Maxfiylik va jamiyat qoidalariga rioya qiling.
                  </p>
                  <p style={{ margin: "8px 0 0", color: "#3ea6ff", fontSize: 13, fontWeight: 700 }}>Batafsil</p>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", padding: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 8, alignItems: "center", borderRadius: 999, background: "rgba(255,255,255,.08)", padding: "6px 8px 6px 12px" }}>
                  <input
                    value={ownerMessage}
                    onChange={(e) => setOwnerMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendChat("owner", ownerMessage);
                      }
                    }}
                    placeholder="Chatga yozing"
                    style={{ width: "100%", minWidth: 0, height: 36, border: 0, background: "transparent", color: "white", padding: "0 8px 0 0", outline: "none" }}
                  />
                  <button
                    type="button"
                    aria-label="Emoji"
                    style={{ height: 32, width: 32, border: "1px solid rgba(255,255,255,.25)", borderRadius: "50%", background: "transparent", color: "rgba(255,255,255,.85)", cursor: "pointer", display: "grid", placeItems: "center" }}
                  >
                    <Smile size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Yuborish"
                    onClick={() => sendChat("owner", ownerMessage)}
                    style={{ height: 32, width: 32, border: "1px solid rgba(255,255,255,.25)", borderRadius: "50%", background: "transparent", color: "rgba(255,255,255,.9)", cursor: "pointer", display: "grid", placeItems: "center" }}
                  >
                    <PlusCircle size={16} />
                  </button>
                </div>
              </div>
            </section>
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

