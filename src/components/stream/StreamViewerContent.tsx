"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Bell,
  Gift,
  Heart,
  MoreHorizontal,
  Paperclip,
  Pin,
  Reply,
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
    <main className="flex h-full min-h-0 w-full min-w-0 flex-col bg-transparent p-3">
      <div className="grid h-full min-h-0 w-full min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
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
                  {STREAMER.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={STREAMER.avatar}
                      alt={STREAMER.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={24} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[18px] font-semibold text-white">
                    {STREAMER.username}
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
              {STREAMER.username} — Jonli efir #{streamId}
            </h1>

            <p className="mt-2 text-[15px] text-white/60">
              {STREAMER.game} · {STREAMER.language}
            </p>
          </div>
        </section>

        <aside className="flex min-h-[620px] min-w-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#141414] xl:min-h-0 xl:h-full">
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#16171a]/95 px-4">
            <p className="text-[18px] font-bold text-white">Jonli Chat</p>

            <div className="flex shrink-0 items-center gap-2 text-[14px] text-white/65">
              <span>Eng yaxshi chat</span>
              <Users size={15} />
              <span>52k</span>
            </div>
          </div>

          <div className="shrink-0 border-b border-white/10 bg-[#1b1c1f] p-3">
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-[#222326] px-3 py-3">
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

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <div className="flex flex-col gap-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className="min-w-0 rounded-md border border-white/10 bg-[#1a1b1e] px-3 py-2.5"
                >
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
                        className="text-[#03ff93] underline decoration-[#03ff93]/70 underline-offset-2"
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
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#15161a]/95 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-[#1c1c1c] px-3">
                <button type="button" aria-label="Sovg'a" className="shrink-0 text-white/65 transition hover:text-white">
                  <Gift size={18} />
                </button>
                <button type="button" aria-label="Emoji" className="shrink-0 text-white/65 transition hover:text-white">
                  <Smile size={18} />
                </button>
                <button type="button" aria-label="Ulashish" className="shrink-0 text-white/65 transition hover:text-white">
                  <Paperclip size={18} />
                </button>

                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write some text.."
                  className="h-full w-full min-w-0 bg-transparent text-[14px] text-white placeholder:text-white/55 outline-none"
                />

                <button type="button" aria-label="Yuborish" className="shrink-0 text-white/65 transition hover:text-white">
                  <Send size={17} />
                </button>
              </div>

              <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#1c1c1c] text-[#ff2d55]">
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
              <span className="text-[14px] font-medium">
                Xabarni o&apos;chirish
              </span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
