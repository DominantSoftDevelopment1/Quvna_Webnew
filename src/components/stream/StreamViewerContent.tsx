"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Bell,
  Gift,
  Heart,
  MoreHorizontal,
  Pin,
  Send,
  Smile,
  User,
  Users,
} from "lucide-react";
import { BASE_URL } from "@/lib/constants";

function buildWsUrl(baseUrl: string, streamId: string): string {
  return `${baseUrl.replace(/^http/, "ws").replace(/\/$/, "")}/scws/${streamId}`;
}

function buildHlsCandidates(streamId: string): string[] {
  const cdn = "https://quvna-live.b-cdn.net";
  const origin = "https://quvna.dominantsoftdevelopment.uz";

  return [
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

const STREAMER = {
  username: "skezzzxc",
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
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);

  const hlsCandidates = useMemo(
    () => (streamId ? buildHlsCandidates(streamId) : []),
    [streamId]
  );

  const hlsUrl = hlsCandidates[hlsIndex] ?? "";

  const chatMessages = useMemo(
    () => [
      {
        id: "1",
        user: "CrazyShoot",
        color: "text-[#9c5ffa]",
        text: "Wow, fantastic prizepool !!🏆🏆",
      },
      {
        id: "2",
        user: "Ranger",
        color: "text-[#03ff93]",
        text: "That was insane dude...Xar is playing",
      },
      {
        id: "3",
        user: "Queeeen1",
        color: "text-[#ffe50f]",
        text: "Menyala abangkuh 🔥🔥🔥",
      },
      {
        id: "4",
        user: "grymnr_",
        color: "text-[#fc363f]",
        text: "ultra",
        withGift: true,
      },
    ],
    []
  );

  const watchedChannels = useMemo(
    () => [
      { id: "c1", name: "skezzzxc", game: "Grand Theft Auto V", viewers: "572" },
      { id: "c2", name: "kaeli", game: "Grand Theft Auto V", viewers: "259" },
      { id: "c3", name: "britshikinoff", game: "Obshenie", viewers: "10 238" },
      { id: "c4", name: "asweisbtv", game: "Grand Theft Auto V", viewers: "162" },
      { id: "c5", name: "stariy_bog", game: "Dota 2", viewers: "4 156" },
    ],
    []
  );

  useEffect(() => {
    if (!streamId) return;

    const ws = new WebSocket(buildWsUrl(BASE_URL, streamId));
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ action: "viewer", streamId }));

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Record<string, unknown>;

        if (
          data.action === "liveUserCount" &&
          typeof data.liveUserCount === "number"
        ) {
          setLiveUserCount(data.liveUserCount);
        }
      } catch {}
    };

    return () => {
      ws.close();
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, [streamId]);

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
    <main className="w-full min-w-0 box-border bg-[#0e0e10] px-4 py-4">
      <div className="mx-auto grid w-full max-w-[1760px] min-w-0 grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)_390px] 2xl:grid-cols-[300px_minmax(0,1fr)_420px]">
        <aside className="hidden min-w-0 overflow-hidden border border-white/10 bg-[#18181b] xl:flex xl:flex-col">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-white/80">
              Kuzatilayotgan kanallar
            </p>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
            {watchedChannels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                className="flex w-full min-w-0 items-center gap-3 bg-[#1f1f23] px-3 py-2 text-left transition hover:bg-[#26262c]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2f2f35] text-[13px] font-bold text-white">
                  {channel.name.slice(0, 1).toUpperCase()}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-white">
                    {channel.name}
                  </span>
                  <span className="block truncate text-[12px] text-white/60">
                    {channel.game}
                  </span>
                </span>

                <span className="shrink-0 text-[12px] font-bold text-[#ff4f4f]">
                  {channel.viewers}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden border border-white/10 bg-[#111315]">
          <div className="relative w-full bg-black">
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              className="aspect-video w-full bg-black object-contain"
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

            <div className="absolute right-4 top-4 inline-flex items-center gap-2 border border-white/20 bg-black/70 px-3 py-1.5 text-[12px] font-semibold text-white">
              <Users size={14} />
              <span>{liveUserCount}</span>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-5 md:px-6">
            <h1 className="break-words text-[22px] font-bold leading-[1.25] text-white md:text-[26px]">
              {STREAMER.username} — Jonli efir #{streamId}
            </h1>

            <p className="mt-2 text-[15px] text-white/60">
              {STREAMER.game} · {STREAMER.language}
            </p>

            <div className="mt-5 flex min-w-0 flex-wrap items-center gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#24262b] text-white">
                  {STREAMER.avatar ? (
                    <img
                      src={STREAMER.avatar}
                      alt={STREAMER.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={21} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-white">
                    {STREAMER.username}
                  </p>
                  <p className="text-[13px] text-white/50">Streamer</p>
                </div>
              </div>

              <button className="inline-flex h-9 shrink-0 items-center justify-center bg-white/90 px-4 text-center text-[13px] font-semibold leading-none text-black transition hover:bg-white/80">
                Obuna bo&apos;lish
              </button>
            </div>
          </div>
        </section>

        <aside className="flex min-h-[620px] min-w-0 flex-col overflow-hidden border border-white/10 bg-[#141414] xl:h-[calc(100vh-32px)]">
          <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-white/10 px-4">
            <p className="text-[18px] font-bold text-white">Jonli Chat</p>

            <div className="flex shrink-0 items-center gap-2 text-[14px] text-white/65">
              <span>Eng yaxshi chat</span>
              <Users size={15} />
              <span>52k</span>
            </div>
          </div>

          <div className="border-b border-white/10 bg-[#1b1c1f] p-3">
            <div className="flex min-w-0 items-center justify-between gap-3 bg-[#222326] px-3 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Pin size={15} className="shrink-0 text-white/55" />
                <span className="shrink-0 text-[14px] font-semibold text-white/60">
                  7
                </span>
                <p className="truncate text-[14px] font-semibold uppercase text-white">
                  with an addon called ul...
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteSheet(true)}
                className="shrink-0 text-white/70"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
            {chatMessages.map((message) => (
              <div key={message.id} className="min-w-0">
                <p className="break-words text-[14px] leading-[1.45] text-white">
                  {message.withGift && (
                    <Gift size={13} className="mr-1 inline text-[#03ff93]" />
                  )}
                  <span className={`mr-1 font-bold ${message.color}`}>
                    {message.user}:
                  </span>
                  <span>{message.text}</span>
                </p>

                {message.id !== "4" && (
                  <p className="mt-1 break-words text-[13px] leading-[1.45] text-white/85">
                    with an addon called Ultra Hardcore, more info{" "}
                    <a
                      className="text-[#6172f3] underline"
                      href="https://www.curseforge.com/wow/addons/ultra-hardcore"
                      target="_blank"
                      rel="noreferrer"
                    >
                      https://www.curseforge.com/wow/addons/ultra-hardcore
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2 border border-white/10 bg-[#1c1c1c] px-3">
                <Gift size={18} className="shrink-0 text-white/65" />
                <Smile size={18} className="shrink-0 text-white/65" />

                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write some text.."
                  className="h-full w-full min-w-0 bg-transparent text-[14px] text-white placeholder:text-white/55 outline-none"
                />

                <Send size={17} className="shrink-0 text-white/65" />
              </div>

              <button className="grid h-11 w-11 shrink-0 place-items-center bg-[#1c1c1c] text-[#ff2d55]">
                <Heart size={18} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {showDeleteSheet && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/70 p-0 md:p-6">
          <div className="w-full max-w-[430px] rounded-t-[20px] bg-[#222326] p-4 md:rounded-[20px]">
            <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-white/25" />

            <button
              onClick={() => setShowDeleteSheet(false)}
              className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-white"
            >
              <Bell size={18} className="text-red-500" />
              <span className="text-[14px] font-medium">Xabarni o&apos;chirish</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

