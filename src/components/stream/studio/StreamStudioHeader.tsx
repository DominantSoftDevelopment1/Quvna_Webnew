"use client";

import { Settings } from "lucide-react";
import type { StreamStudioController } from "@/components/stream/studio/streamStudioTypes";

type Props = Pick<
  StreamStudioController,
  "isLive" | "isWaiting" | "liveUserCount" | "settingsOpen" | "setSettingsOpen"
>;

export function StreamStudioHeader({ isLive, isWaiting, liveUserCount, settingsOpen, setSettingsOpen }: Props) {
  return (
    <header className="box-border flex h-14 w-full min-w-0 shrink-0 items-center justify-between border-b border-[#26262c] bg-[#18181b] px-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-base font-bold tracking-tight text-[#efeff1]">Quvna Studio</span>
      </div>

      <div className="flex min-w-0 shrink-0 items-center gap-3">
        {isLive ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[#ff4f4f] opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4f4f]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#ff4f4f]">LIVE</span>
            <span className="hidden text-xs text-[#adadb8] sm:inline">{liveUserCount} tomoshabin</span>
          </>
        ) : isWaiting ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">OBS kutish</span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-wider text-[#5c5c6d]">Offline</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setSettingsOpen((v) => !v)}
        className={`box-border inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors ${
          settingsOpen ? "bg-[#26262c] text-[#efeff1]" : "text-[#adadb8] hover:bg-[#26262c] hover:text-[#efeff1]"
        }`}
        title="Sozlamalar"
      >
        <Settings className="h-5 w-5" aria-hidden />
      </button>
    </header>
  );
}
