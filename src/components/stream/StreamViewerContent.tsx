"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Reply, User, Users } from "lucide-react";
import { WS_URL } from "@/lib/constants";
import {
  flattenStreamChatWsPayload,
  getStoredStreamUserId,
  inferLineIsStreamHost,
  parseStreamChatInbound,
  type ParsedChatLine,
} from "@/lib/streamChat";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "@/hooks/useProfile";
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
  avatarHref?: string;
  subtitle?: string;
};

function mapParsedLineToChatRow(
  line: ParsedChatLine,
  ownerId?: number | null,
  ownerPublicDisplayName?: string | null
): ChatMessageRow {
  return {
    id: String(line.id),
    user: line.user,
    color: chatUsernameColorClass(line.user),
    text: line.text,
    isHost: inferLineIsStreamHost(line, ownerId ?? undefined, ownerPublicDisplayName ?? undefined),
    ...(line.senderUserId != null ? { senderUserId: line.senderUserId } : {}),
    ...(line.isStreamOwnerHint ? { ownerHint: true } : {}),
    ...(line.avatarHref ? { avatarHref: line.avatarHref } : {}),
    ...(line.subtitle ? { subtitle: line.subtitle } : {}),
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

  const streamOwnerPublicNameRef = useRef("");
  const streamTitle = useMemo(() => {
    const name = streamMeta?.name?.trim();
    const t = streamMeta?.title?.trim();
    return name || t || "";
  }, [streamMeta]);

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
    };
  }, [streamMeta]);

  const hlsCandidates = useMemo(
    () => (streamId ? buildHlsCandidates(streamId) : []),
    [streamId]
  );

  const hlsUrl = hlsCandidates[hlsIndex] ?? "";

  const currentUserId = useMemo(() => getStoredStreamUserId(), []);

  // Studio bilan bir xil: localStorage cache → auth store → profile
  const storeUser = useAuthStore((s) => s.user);
  const profileUserId = storeUser?.id != null ? Number(storeUser.id) : getStoredStreamUserId();
  const { data: profileData } = useProfile(
    profileUserId != null && Number.isFinite(profileUserId) && profileUserId > 0 ? profileUserId : null
  );

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

  const myDisplayNameRef = useRef(myDisplayName);
  useEffect(() => { myDisplayNameRef.current = myDisplayName; }, [myDisplayName]);

  const panelMessages = useMemo(
    () =>
      chatMessages.map((m) => {
        const isMe = currentUserId != null && m.senderUserId != null && m.senderUserId === currentUserId;
        return {
          id: m.id,
          user: isMe ? myDisplayName : m.user,
          text: m.text,
          userColorClass: m.color,
          withGift: m.withGift,
          isHost: m.isHost,
          isMe,
          ...(m.avatarHref ? { avatarHref: m.avatarHref } : {}),
          ...(m.subtitle ? { subtitle: m.subtitle } : {}),
        };
      }),
    [chatMessages, currentUserId, myDisplayName]
  );

  /** Strim egasi ro‘yxatdan kelgach badge’lar yangilansin */
  useEffect(() => {
    setChatMessages((prev) =>
      prev.map((m) => {
        const lineLike: ParsedChatLine = {
          id: m.id,
          user: m.user,
          text: m.text,
          ...(m.senderUserId != null ? { senderUserId: m.senderUserId } : {}),
          ...(m.ownerHint ? { isStreamOwnerHint: true } : {}),
        };
        const isHostNow = inferLineIsStreamHost(
          lineLike,
          streamOwnerUserId ?? undefined,
          streamOwnerPublicNameRef.current || undefined
        );
        return {
          ...m,
          isHost: isHostNow || !!m.ownerHint,
        };
      })
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
        const uid = getStoredStreamUserId();
        const username = myDisplayNameRef.current;
        ws.send(
          JSON.stringify({
            action: "viewer",
            streamId,
            ...(uid != null ? { userId: uid } : {}),
            ...(username ? { username, senderName: username, displayName: username } : {}),
          })
        );
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

          const line = parseStreamChatInbound(flattenStreamChatWsPayload(payload as Record<string, unknown>));
          if (!line) return;

          if (/stream\s+not\s+found\b/i.test(line.text.trim())) {
            setChatError(line.text.trim());
            return;
          }

          const idStr = String(line.id);
          setChatMessages((prev) => {
            if (prev.some((m) => String(m.id) === idStr)) return prev;
            const withoutMatchingOptimistic = prev.filter((m) => {
              if (!String(m.id).startsWith("opt-")) return true;
              const sameUid =
                m.senderUserId != null && line.senderUserId != null && m.senderUserId === line.senderUserId;
              const sameText = m.text.trim() === line.text.trim();
              return !(sameUid && sameText);
            });
            return [
              ...withoutMatchingOptimistic,
              mapParsedLineToChatRow(line, streamOwnerUserIdRef.current, streamOwnerPublicNameRef.current),
            ];
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
        setChatMessages(
          lines.map((l) => mapParsedLineToChatRow(l, ownerId, streamOwnerPublicNameRef.current || null))
        );
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
    const username = myDisplayNameRef.current;
    if (userId == null) {
      setChatError("Chat uchun akkauntga kiring.");
      return;
    }
    setChatError(null);
    if (wsRef.current?.readyState !== WebSocket.OPEN || !streamId) {
      setChatError("Chat ulanishi tayyor emas — biroz kuting yoki sahifani yangilang.");
      return;
    }
    const nameForWire = username && username !== "Men" ? username : undefined;

    const optimisticId = `opt-${Date.now()}`;
    const optimisticLine: ParsedChatLine = {
      id: optimisticId,
      user: username,
      text: msg,
      senderUserId: userId,
    };
    setChatMessages((prev) => [
      ...prev,
      mapParsedLineToChatRow(
        optimisticLine,
        streamOwnerUserIdRef.current,
        streamOwnerPublicNameRef.current || null
      ),
    ]);

    setChatInput("");
    wsRef.current.send(
      JSON.stringify({
        action: "streamChatMessage",
        streamId,
        userId,
        message: msg,
        ...(nameForWire
          ? {
              username: nameForWire,
              senderName: nameForWire,
              displayName: nameForWire,
              nickname: nameForWire,
              user: {
                id: userId,
                username: nameForWire,
                userName: nameForWire,
                nickname: nameForWire,
              },
              senderUserResponseDTO: {
                id: userId,
                username: nameForWire,
                userName: nameForWire,
                nickname: nameForWire,
              },
            }
          : {}),
      })
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

  const pinnedLine = streamTitle || `${streamerDisplay.username} — jonli efir`;

  return (
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col bg-transparent p-3 sm:p-4 lg:p-5">
      <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_480px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#111214] shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
          <div className="w-full bg-[#090a0b] p-2 sm:p-2.5">
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

              <div className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-md border border-white/20 bg-black/70 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4">
                <Users size={14} className="shrink-0 text-white/90" aria-hidden />
                <span className="tabular-nums">{liveUserCount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex w-full flex-col gap-4 py-1 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#24262b] text-white sm:h-14 sm:w-14">
                  {streamerDisplay.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={streamerDisplay.avatar}
                      alt={streamerDisplay.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={24} className="text-white/80" aria-hidden />
                  )}
                </div>

                <div className="min-w-0 pr-1">
                  <p className="flex min-w-0 flex-wrap items-center gap-2 text-[17px] font-semibold leading-snug text-white sm:text-[18px]">
                    <span className="truncate">{streamerDisplay.username}</span>
                    <StreamHostBadge />
                  </p>
                  <p className="mt-1 text-[13px] text-white/50 sm:text-sm">Streamer</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:justify-end sm:gap-3 sm:pl-2">
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#03ff93] px-4 py-2 text-[14px] font-semibold text-black transition hover:bg-[#00e884] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03ff93]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214] sm:px-5"
                >
                  Obuna bo&apos;lish
                </button>

                <button
                  type="button"
                  aria-label="Ulashish"
                  className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#272727] px-4 py-2 text-white transition hover:bg-[#323232] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111214] sm:px-[18px]"
                >
                  <Reply size={16} className="shrink-0 text-white/90" aria-hidden />
                  <span className="text-[14px] font-semibold">Ulashish</span>
                </button>
              </div>
            </div>

            <h1 className="my-3 break-words text-[21px] font-bold leading-snug text-white sm:my-4 sm:text-[24px] md:text-[25px]">
              {streamerDisplay.username} — Jonli efir #{streamId}
            </h1>

            <p className="mt-1 text-[14px] leading-relaxed text-white/65 sm:text-[15px]">
              {streamTitle ? streamTitle : "Stream tavsifi API dan kelgach shu yerda ko‘rinadi."}
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
          pinnedRank=""
          pinnedTitle={pinnedLine}
        />
      </div>
    </main>
  );
}
