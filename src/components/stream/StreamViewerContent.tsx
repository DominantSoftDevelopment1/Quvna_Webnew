"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Reply, User, Users } from "lucide-react";
import { WS_URL } from "@/lib/constants";
import {
  getStoredStreamUserId,
  inferLineIsStreamHost,
  parseStreamChatInbound,
  type ParsedChatLine,
} from "@/lib/streamChat";
import { fetchStreamChatHistory } from "@/lib/streamChatHistory";
import { buildStreamWsUrl } from "@/lib/streamWs";
import { chatUsernameColorClass, StreamChatPanel } from "@/components/stream/StreamChatPanel";
import { useStreams } from "@/hooks/useMedia";
import { StreamHostBadge } from "@/components/stream/StreamHostBadge";

type ChatMessageRow = {
  id: string;
  user: string;
  color: string;
  text: string;
  withGift?: boolean;
  isHost?: boolean;
  senderUserId?: number;
  ownerHint?: boolean;
};

function mapParsedLineToChatRow(line: ParsedChatLine, ownerId?: number | null): ChatMessageRow {
  return {
    id: String(line.id),
    user: line.user,
    color: chatUsernameColorClass(line.user),
    text: line.text,
    isHost: inferLineIsStreamHost(line, ownerId ?? undefined),
    ...(line.senderUserId != null ? { senderUserId: line.senderUserId } : {}),
    ...(line.isStreamOwnerHint ? { ownerHint: true } : {}),
  };
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

interface StreamViewerContentProps {
  streamId: string;
}

const STREAMER_FALLBACK = {
  username: "Streamer",
  avatar: "",
  game: "Grand Theft Auto V",
  language: "Ruscha",
};

export function StreamViewerContent({ streamId }: StreamViewerContentProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [hlsIndex, setHlsIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [socketHint, setSocketHint] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessageRow[]>([]);
  const [chatHistoryStatus, setChatHistoryStatus] = useState<"loading" | "ready" | "failed">("loading");

  const { data: streams = [] } = useStreams();

  const streamMeta = useMemo(
    () => streams.find((s) => String(s.id) === String(streamId)),
    [streams, streamId]
  );

  const streamOwnerUserId = useMemo(() => {
    const raw = streamMeta?.user?.id;
    if (raw == null) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [streamMeta]);

  const streamOwnerUserIdRef = useRef(streamOwnerUserId);
  streamOwnerUserIdRef.current = streamOwnerUserId;

  const streamerDisplay = useMemo(() => {
    const u = streamMeta?.user;
    if (!u) return STREAMER_FALLBACK;
    const name =
      (u.username?.trim() ||
        u.fullName?.trim() ||
        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()) ||
      STREAMER_FALLBACK.username;
    return {
      username: name,
      avatar: u.avatar ?? "",
      game: STREAMER_FALLBACK.game,
      language: STREAMER_FALLBACK.language,
    };
  }, [streamMeta]);

  const hlsCandidates = useMemo(
    () => (streamId ? buildHlsCandidates(streamId) : []),
    [streamId]
  );

  const hlsUrl = hlsCandidates[hlsIndex] ?? "";

  const currentUserId = useMemo(() => getStoredStreamUserId(), []);

  const panelMessages = useMemo(
    () =>
      chatMessages.map((m) => ({
        id: m.id,
        user: m.user,
        text: m.text,
        userColorClass: m.color,
        withGift: m.withGift,
        isHost: m.isHost,
        isMe: currentUserId != null && m.senderUserId != null && m.senderUserId === currentUserId,
      })),
    [chatMessages, currentUserId]
  );

  /** Strim egasi ro‘yxatdan kelgach badge’lar yangilansin */
  useEffect(() => {
    setChatMessages((prev) =>
      prev.map((m) => ({
        ...m,
        isHost: !!(
          m.ownerHint ||
          (streamOwnerUserId != null &&
            m.senderUserId != null &&
            m.senderUserId === streamOwnerUserId)
        ),
      }))
    );
  }, [streamOwnerUserId]);

  /** Avval REST chat tarixi (`getAllBy`), keyin WebSocket — yangilar socketdan. */
  useEffect(() => {
    if (!streamId?.trim()) return;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let disconnectStreak = 0;
    let isFirstSocket = true;

    const clearReconnect = () => {
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      clearReconnect();
      if (cancelled || !streamId) return;

      if (isFirstSocket) {
        setSocketHint("Chat ulanmoqda…");
        isFirstSocket = false;
      } else {
        setSocketHint("Chat qayta ulanmoqda…");
      }

      const ws = new WebSocket(buildStreamWsUrl(WS_URL, streamId));
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled || wsRef.current !== ws) return;
        disconnectStreak = 0;
        setSocketHint(null);
        ws.send(JSON.stringify({ action: "viewer", streamId }));
      };

      ws.onmessage = (event) => {
        try {
          const raw = event.data;
          if (typeof raw !== "string") return;
          const data = JSON.parse(raw) as Record<string, unknown>;

          const action = typeof data.action === "string" ? data.action.toLowerCase() : "";
          if (action === "error" || action === "streamerror" || action === "stream_not_found") {
            const msg =
              (typeof data.message === "string" && data.message) ||
              (typeof data.error === "string" && data.error) ||
              "Chat server xatoligi";
            setChatError(msg);
            return;
          }

          if (
            data.action === "liveUserCount" &&
            typeof data.liveUserCount === "number"
          ) {
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
          if (!line) return;

          if (/stream\s+not\s+found\b/i.test(line.text.trim())) {
            setChatError(line.text.trim());
            return;
          }

          const idStr = String(line.id);
          setChatMessages((prev) => {
            if (prev.some((m) => String(m.id) === idStr)) return prev;
            return [...prev, mapParsedLineToChatRow(line, streamOwnerUserIdRef.current)];
          });
        } catch {
          /* ignore malformed */
        }
      };

      ws.onerror = () => {
        if (!cancelled && wsRef.current === ws) {
          setSocketHint("Chat socket xatolik");
        }
      };

      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null;
        if (cancelled) return;

        disconnectStreak += 1;
        const maxReconnects = 12;
        if (disconnectStreak <= maxReconnects) {
          reconnectTimer = setTimeout(
            connect,
            Math.min(1200 + disconnectStreak * 500, 15_000)
          );
        } else {
          setSocketHint(null);
          setChatError(
            "Chat serveriga ulanib bo‘lmadi. `.env.local` da `NEXT_PUBLIC_WS_URL` (masalan `wss://…`) tekshiring."
          );
        }
      };
    };

    const run = async () => {
      setChatHistoryStatus("loading");
      setChatMessages([]);
      setSocketHint("Chat tarixi yuklanmoqda…");
      try {
        const lines = await fetchStreamChatHistory(streamId, { page: 0, size: 10 });
        if (cancelled) return;
        const ownerId = streamOwnerUserIdRef.current;
        setChatMessages(lines.map((l) => mapParsedLineToChatRow(l, ownerId)));
        setChatHistoryStatus("ready");
      } catch {
        if (!cancelled) {
          setChatHistoryStatus("failed");
          setChatMessages([]);
        }
      }

      if (cancelled) return;
      connect();
    };

    void run();

    return () => {
      cancelled = true;
      clearReconnect();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [streamId]);

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    const userId = getStoredStreamUserId();
    if (userId == null) {
      setChatError("Chat uchun akkauntga kiring.");
      return;
    }
    setChatError(null);
    if (wsRef.current?.readyState !== WebSocket.OPEN || !streamId) {
      setChatError("Chat ulanishi tayyor emas — biroz kuting yoki sahifani yangilang.");
      return;
    }
    setChatInput("");
    wsRef.current.send(
      JSON.stringify({ action: "streamChatMessage", streamId, userId, message: msg })
    );
  };

  useEffect(() => {
    if (!streamId || !hlsUrl || !videoRef.current) return;

    const video = videoRef.current;
    setIsPlaying(false);

    const cleanup = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    const nextFallback = () => {
      setIsPlaying(false);
      setHlsIndex((prev) =>
        prev + 1 < hlsCandidates.length ? prev + 1 : prev
      );
    };

    cleanup();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      video.onloadeddata = () => setIsPlaying(true);
      video.onerror = nextFallback;
      void video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 2,
      });

      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsPlaying(true);
        void video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) nextFallback();
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

  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col bg-transparent p-3">
      <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#111214] shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
          <div className="w-full bg-[#090a0b] p-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/15 bg-black">
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="h-full w-full bg-black object-contain"
              />

              {!isPlaying && (
                <div className="absolute inset-0 grid place-items-center bg-black/70 text-center">
                  <div className="px-6">
                    <p className="text-[20px] font-bold text-white">
                      Jonli efir yuklanmoqda...
                    </p>
                    <p className="mt-2 text-[14px] text-white/70">
                      Signal kelishi uchun bir necha soniya kuting.
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/70 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm">
                <Users size={14} />
                <span>{liveUserCount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex w-full items-center gap-4 py-[10px]">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24262b] text-white">
                  {streamerDisplay.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={streamerDisplay.avatar}
                      alt={streamerDisplay.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="flex min-w-0 flex-wrap items-center gap-2 truncate text-[18px] font-semibold text-white">
                    <span className="truncate">{streamerDisplay.username}</span>
                    <StreamHostBadge />
                  </p>
                  <p className="text-[14px] text-white/50">Streamer</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3 px-[10px]">
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-[#03ff93] px-5 text-[14px] font-semibold text-black transition hover:bg-[#00e884]">
                  Obuna bo&apos;lish
                </button>

                <button
                  type="button"
                  aria-label="Share"
                  className="inline-flex h-10 items-center gap-2 rounded-md bg-[#272727] px-[18px] text-white transition hover:bg-[#323232]"
                >
                  <Reply size={16} />
                  <span className="text-[14px] font-semibold">Share</span>
                </button>
              </div>
            </div>

            <h1 className="my-[10px] break-words text-[22px] font-bold leading-[1.25] text-white md:text-[25px]">
              {streamerDisplay.username} — Jonli efir #{streamId}
            </h1>

            <p className="mt-2 text-[15px] text-white/60">
              {streamerDisplay.game} · {streamerDisplay.language}
            </p>
          </div>
        </section>

        <StreamChatPanel
          className=""
          liveUserCount={liveUserCount}
          socketHint={socketHint}
          chatHistoryStatus={chatHistoryStatus}
          messages={panelMessages}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSend={sendChat}
          chatError={chatError}
          onChatErrorDismiss={() => setChatError(null)}
          pinnedRank="7"
          pinnedTitle="WITH AN ADDON CALLED UL..."
        />
      </div>
    </main>
  );
}
