"use client";

import Link from "next/link";
import { Check, Edit3, ExternalLink, Link2, Shield, Users2 } from "lucide-react";
import type { StreamStudioController } from "@/components/stream/studio/streamStudioTypes";

type Props = Pick<
  StreamStudioController,
  | "streamId"
  | "busy"
  | "isLive"
  | "createStream"
  | "stopStream"
  | "startLive"
  | "watchCopied"
  | "copyWatchUrl"
  | "viewerWatchUrl"
  | "setSettingsOpen"
>;

export function StreamStudioControlStrip({
  streamId,
  busy,
  isLive,
  createStream,
  stopStream,
  startLive,
  watchCopied,
  copyWatchUrl,
  viewerWatchUrl,
  setSettingsOpen,
}: Props) {
  return (
    <div className="box-border flex min-h-[52px] w-full min-w-0 flex-wrap items-center gap-2 border-b border-[#26262c] bg-[#18181b] px-4 py-3 sm:gap-3">
      {!streamId ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void createStream()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] font-medium text-[#adadb8] transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
        >
          {busy ? "Yaratilmoqda…" : "Yaratish"}
        </button>
      ) : (
        <>
          {!isLive && (
            <button
              type="button"
              disabled={busy}
              onClick={startLive}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#00f593] px-3 text-[13px] font-bold text-[#0e0e10] transition hover:brightness-110 disabled:opacity-50"
            >
              Jonli boshlash
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void stopStream()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/10 px-3 text-[13px] font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {isLive ? "To&apos;xtatish" : "Yopish"}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#a970ff] px-3 text-[13px] font-semibold text-[#0e0e10] hover:brightness-110"
      >
        <Edit3 size={13} aria-hidden />
        Tahrirlash
      </button>
      <Link
        href="/profile/edit"
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1f1f23] px-3 text-[13px] text-[#adadb8] hover:bg-[#26262c] hover:text-white"
      >
        Profil
      </Link>
      <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1f1f23] px-3 text-[13px] text-[#adadb8] hover:bg-[#26262c] hover:text-white">
        <Shield size={13} aria-hidden />
        Sozlamalar
      </button>
      <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1f1f23] px-3 text-[13px] text-[#adadb8] hover:bg-[#26262c] hover:text-white">
        <Users2 size={13} aria-hidden />
        Moderatsiya
      </button>
      <button
        type="button"
        onClick={() => void copyWatchUrl()}
        className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1f1f23] px-3 text-[13px] text-[#adadb8] hover:bg-[#26262c] hover:text-white"
      >
        {watchCopied ? <Check size={13} className="text-[#00f593]" aria-hidden /> : <Link2 size={13} aria-hidden />}
        Havola
      </button>
      {viewerWatchUrl ? (
        <a
          href={viewerWatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#1f1f23] text-[#adadb8] hover:bg-[#26262c] hover:text-white"
          aria-label="Tomosha sahifasi"
        >
          <ExternalLink size={13} aria-hidden />
        </a>
      ) : (
        <span
          className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md bg-[#1f1f23] text-[#adadb8]/40"
          aria-label="Tomosha havolasi mavjud emas"
        >
          <ExternalLink size={13} aria-hidden />
        </span>
      )}
    </div>
  );
}
