"use client";

import Link from "next/link";
import { Check, Copy, Edit3, User } from "lucide-react";
import { useState } from "react";
import type { StreamStudioController } from "@/components/stream/studio/streamStudioTypes";

type Props = Pick<
  StreamStudioController,
  | "myDisplayName"
  | "title"
  | "game"
  | "profileAvatarSrc"
  | "showProfileAvatarSkeleton"
  | "profileNumericId"
  | "profileBio"
  | "overlayText"
  | "setOverlayText"
  | "viewerWatchUrl"
>;

export function StreamStudioStreamerBar({
  myDisplayName,
  title,
  game,
  profileAvatarSrc,
  showProfileAvatarSkeleton,
  profileNumericId,
  profileBio,
  overlayText,
  setOverlayText,
  viewerWatchUrl,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    const url = viewerWatchUrl || window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="box-border flex min-h-[72px] w-full min-w-0 items-start gap-4 border-b border-[#26262c] bg-[#18181b] px-4 py-4 sm:items-center sm:gap-5 sm:px-6">
      <div className="relative shrink-0">
        <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#a970ff] bg-[#2d2d35] sm:h-14 sm:w-14">
          {showProfileAvatarSkeleton ? (
            <div className="h-full w-full animate-pulse bg-zinc-600/40 motion-reduce:animate-none" aria-hidden />
          ) : profileAvatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileAvatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-6 w-6 text-[#a970ff]/70" aria-hidden />
            </div>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#18181b] bg-[#00f593]" />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-base font-bold text-[#efeff1]">{myDisplayName}</span>
          <span className="shrink-0 rounded bg-[#00f593]/10 px-2 py-0.5 text-[11px] font-semibold text-[#00f593]">СТРИМЕР</span>
        </div>
        <p className={`mt-0.5 truncate text-sm ${title.trim() ? "text-[#adadb8]" : "italic text-[#53535f]"}`}>
          {title.trim() || "Sarlavxa sozlamalardan"}
        </p>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2 text-[12px] text-zinc-500">
          <span className="shrink-0 rounded bg-[#1f1f23] px-2.5 py-1 text-[#adadb8]">{game}</span>
          <span className="tabular-nums">ID: {profileNumericId != null ? profileNumericId : "—"}</span>
          <Link href="/profile/edit" className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#00f593] hover:underline">
            <Edit3 size={12} aria-hidden />
            Profil
          </Link>
        </div>
        {profileBio ? <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-zinc-400">{profileBio}</p> : null}

        <div className="relative mt-3 min-w-0">
          <input
            value={overlayText}
            onChange={(e) => setOverlayText(e.target.value)}
            maxLength={120}
            placeholder="Stream tavsifi..."
            className="box-border h-9 w-full min-w-0 rounded-md border border-white/[0.06] bg-[#0e0e10] py-2 pl-3 pr-14 text-[13px] text-[#efeff1] outline-none transition placeholder:text-[#5c5c6d] focus:border-[#a970ff]/40"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] tabular-nums text-[#5c5c6d]">
            {overlayText.length}/120
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
        <button
          type="button"
          onClick={() => void handleCopyUrl()}
          className="box-border inline-flex h-9 w-9 items-center justify-center rounded-md text-[#adadb8] transition hover:bg-[#26262c] hover:text-[#efeff1]"
          title="URL nusxalash"
        >
          {copied ? <Check className="h-5 w-5 text-[#00f593]" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
