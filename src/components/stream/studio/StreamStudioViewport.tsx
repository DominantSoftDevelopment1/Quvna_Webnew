"use client";

import type { RefObject } from "react";
import { Loader2, Tv } from "lucide-react";
import { StreamStudioOverlaysStrip } from "@/components/stream/studio/StreamStudioOverlaysStrip";

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>;
  streamId: string | null;
  hlsPlaying: boolean;
  isLive: boolean;
  isWaiting: boolean;
  liveUserCount: number;
  overlayImages: string[];
  setOverlayImages: (v: string[] | ((p: string[]) => string[])) => void;
};

export function StreamStudioViewport({
  videoRef,
  streamId,
  hlsPlaying,
  isLive,
  isWaiting,
  liveUserCount,
  overlayImages,
  setOverlayImages,
}: Props) {
  return (
    <div className="relative box-border flex aspect-video w-full min-w-0 shrink-0 flex-col overflow-hidden bg-black">
      <div className="relative min-h-0 w-full min-w-0 flex-1">
        {streamId ? (
          <>
            <video ref={videoRef} controls autoPlay muted playsInline className="absolute inset-0 h-full w-full object-contain" />
            {!hlsPlaying && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-10 sm:pb-14">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
                  <Loader2 size={26} className="animate-spin text-white/20 motion-reduce:animate-none" aria-hidden />
                </div>
                <p className="text-sm font-medium text-[#5c5c6d]">Предпросмотр трансляции</p>
                <p className="mt-1 text-xs text-[#3d3d44]">НЕ В СЕТИ</p>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
            <Tv className="h-12 w-12 text-[#53535f]" aria-hidden />
            <p className="text-sm text-[#53535f]">Stream yaratilmagan — pastdagi tugma bilan oching</p>
          </div>
        )}

        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-20"
          style={{
            background: "linear-gradient(to top, rgba(14,14,16,0.9) 0%, transparent 100%)",
          }}
        />

        <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 rounded bg-[#1f1f23]/90 px-2 py-1 text-[11px] font-semibold text-red-400 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 motion-reduce:animate-none" />
              LIVE
            </div>
          ) : isWaiting ? (
            <div className="flex items-center gap-1.5 rounded bg-[#1f1f23]/90 px-2 py-1 text-[11px] font-semibold text-amber-400 backdrop-blur-sm">
              <Loader2 size={11} className="animate-spin motion-reduce:animate-none" aria-hidden />
              НЕ В СЕТИ
            </div>
          ) : (
            <div className="rounded bg-[#1f1f23]/90 px-2 py-1 text-[11px] font-semibold text-[#5c5c6d] backdrop-blur-sm">НЕ В СЕТИ</div>
          )}
        </div>
        {isLive && (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 rounded bg-[#1f1f23]/90 px-2 py-1 backdrop-blur-sm">
            <span className="text-[11px] font-bold tabular-nums text-[#00f593]">{liveUserCount}</span>
          </div>
        )}
      </div>

      {streamId ? <StreamStudioOverlaysStrip images={overlayImages} onImagesChange={setOverlayImages} /> : null}
    </div>
  );
}
