"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";

export type StudioChatItem = {
  id: string | number;
  user: string;
  text: string;
  badge?: string;
  color?: string;
  time?: string;
  avatarHref?: string;
  isHost?: boolean;
  reply?: string;
  special?: boolean;
};

function GiftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 6h18v4H3V6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v14" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6c-2.9 0-4.6-.8-4.6-2.2C7.4 2.8 8.1 2 9.1 2c1.5 0 2.4 1.8 2.9 4Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6c2.9 0 4.6-.8 4.6-2.2 0-1-.7-1.8-1.7-1.8-1.5 0-2.4 1.8-2.9 4Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ChatLine({ msg }: { msg: StudioChatItem }) {
  return (
    <div className="group px-3 py-1.5 text-[17px] leading-[26px] hover:bg-white/[0.04] sm:px-3.5 sm:text-[18px] sm:leading-[28px]">
      {msg.reply ? (
        <div className="mb-1 ml-[54px] flex max-w-[min(100%,480px)] min-w-0 items-center rounded-[2px] border border-[#0087ff] bg-[#0c121b] px-2 py-1 text-[13px] text-zinc-300">
          <span className="mr-1 grid h-5 w-5 place-items-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">T</span>
          <span className="truncate">{msg.reply}</span>
        </div>
      ) : null}
      <div className="flex min-w-0 items-start gap-1.5">
        <span className="w-[38px] shrink-0 pt-[2px] text-[11px] text-zinc-500">{msg.time ?? ""}</span>
        <span className="shrink-0 pt-[1px] text-[18px]">{msg.badge ?? "◇"}</span>
        <span className={`font-bold ${msg.color ?? "text-[#00b5ad]"}`}>{msg.user}:</span>
        <span className={`min-w-0 break-words break-all text-zinc-100 ${msg.special ? "text-[22px] font-bold" : ""}`}>{msg.text}</span>
      </div>
    </div>
  );
}

/** Top 3 gifters — bir qatorda, chat kengligiga sig‘adi */
function TopGifters() {
  return (
    <div className="shrink-0 border-b border-[#24262d] bg-[#17181d]">
      <div className="box-border grid min-w-0 w-full grid-cols-3 gap-2 px-2.5 py-2.5 sm:gap-2.5 sm:px-3 sm:py-3">
        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-[15px] sm:h-9 sm:w-9 sm:text-base">
            👑
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold leading-tight text-white sm:text-[11px]">dava_black</p>
            <p className="truncate text-[11px] font-black leading-tight text-yellow-200 sm:text-[12px]">🎁 305</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-700 text-sm sm:h-9 sm:w-9">🥈</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold leading-tight text-white sm:text-[11px]">wolfking0</p>
            <p className="truncate text-[11px] font-black leading-tight text-zinc-200 sm:text-[12px]">🎁 225</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-800 to-stone-900 text-sm sm:h-9 sm:w-9">🥉</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold leading-tight text-white sm:text-[11px]">shadow_tt</p>
            <p className="truncate text-[11px] font-black leading-tight text-amber-200/90 sm:text-[12px]">🎁 98</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export type StudioChatPanelProps = {
  className?: string;
  items: StudioChatItem[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  pinnedText?: string;
  liveUserCount?: number;
  chatError?: string | null;
  onDismissError?: () => void;
  socketHint?: string | null;
  chatHistoryStatus?: "loading" | "ready" | "failed";
  emptyHint?: string;
  /** Bo‘sh chat ostidagi izoh (Figma: ikkinchi qator) */
  emptySubhint?: string;
};

export function StudioChatPanel({
  className = "",
  items,
  chatInput,
  onChatInputChange,
  onSend,
  pinnedText = "",
  liveUserCount = 0,
  chatError,
  onDismissError,
  socketHint,
  chatHistoryStatus = "ready",
  emptyHint = "Hozircha xabar yo'q.",
  emptySubhint = "Jonli efir boshlangach bu yerda muloqot ko‘rinadi.",
}: StudioChatPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pinnedTrimmed = pinnedText.trim();
  const [pinnedExpanded, setPinnedExpanded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setPinnedExpanded(false));
  }, [pinnedTrimmed]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [items.length]);

  return (
    <div className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-[#303039] bg-[#111216] text-white ${className}`}>

      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#303039] bg-[#1f1f23] px-3 sm:h-11 sm:px-4">
        <div className="flex items-center gap-1.5 text-[14px] font-bold text-zinc-100 sm:text-[15px]">
          <span>Moy chat</span>
          <span className="text-zinc-400">⌄</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-[12px]">◯ {liveUserCount}</span>
          <button type="button" className="text-lg leading-none hover:text-white" aria-label="Menu">⋮</button>
        </div>
      </div>

      {/* Socket hint */}
      {socketHint ? (
        <p className="shrink-0 border-b border-[#303039] px-3 py-1.5 text-[11px] text-amber-400/90">{socketHint}</p>
      ) : null}

      {/* Top Gifters */}
      <TopGifters />

      {/* Pinned — devordan inset; bosilganda to‘liq matn */}
      {pinnedTrimmed ? (
        <div className="shrink-0 border-b border-[#24262d] bg-[#111216] px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="box-border flex max-w-full min-w-0 gap-2 rounded-[10px] border border-[#9147ff]/70 bg-[#191322] p-2.5 shadow-[inset_3px_0_0_#9147ff] ring-offset-2 ring-offset-[#111216] transition hover:border-[#a78bfa]/90 hover:bg-[#1e1628] sm:mx-1 sm:gap-2.5 sm:p-3">
            <button
              type="button"
              onClick={() => setPinnedExpanded((v) => !v)}
              className="min-h-0 min-w-0 flex-1 cursor-pointer rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#9147ff]/60"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wide text-[#bf94ff] sm:text-[12px]">
                  📌 Zakreplangan habar
                </span>
              </div>
              <p
                className={`text-[14px] font-semibold leading-snug text-zinc-100 sm:text-[15px] sm:leading-relaxed ${
                  pinnedExpanded ? "whitespace-pre-wrap break-words" : "line-clamp-2 break-words"
                }`}
              >
                {pinnedTrimmed}
              </p>
              {!pinnedExpanded && pinnedTrimmed.length > 90 ? (
                <p className="mt-1.5 text-[11px] font-medium text-[#bf94ff]/80">Bosib to‘liq o‘qing</p>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setPinnedExpanded(false)}
              className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-md text-[15px] leading-none text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              aria-label="Pinni yig‘ish"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {/* Xabarlar maydoni — Figma chat body (node 2-27739): inputdan yuqari; ChatLine o‘zgarmaydi */}
      <div
        ref={ref}
        className="relative box-border min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-t border-white/[0.05] bg-[#0e0f12] [scrollbar-color:rgba(79,79,87,0.55)_transparent] [scrollbar-width:thin]"
      >
        <div
          className="pointer-events-none sticky top-0 z-[1] h-6 shrink-0 bg-gradient-to-b from-[#12131a] to-transparent"
          aria-hidden
        />

        {chatHistoryStatus === "loading" && items.length === 0 ? (
          <div className="flex min-h-[min(240px,40dvh)] flex-col items-center justify-center gap-4 px-6 py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
              <Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]/80 motion-reduce:animate-none" aria-hidden />
            </div>
            <p className="text-center text-[14px] font-semibold text-zinc-300">Chat tarixi yuklanmoqda…</p>
            <p className="max-w-[280px] text-center text-[12px] leading-relaxed text-zinc-500">Bir necha soniya kuting.</p>
          </div>
        ) : null}

        {chatHistoryStatus !== "loading" && items.length === 0 ? (
          <div className="flex min-h-[min(260px,42dvh)] flex-col items-center justify-center gap-4 px-5 py-10 sm:px-8">
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-white/[0.04]">
              <MessageCircle className="h-9 w-9 text-zinc-400" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="max-w-[320px] space-y-2 text-center">
              <p className="text-[15px] font-semibold leading-snug text-zinc-100 sm:text-[16px]">{emptyHint}</p>
              {emptySubhint ? (
                <p className="text-[13px] leading-relaxed text-zinc-500">{emptySubhint}</p>
              ) : null}
            </div>
            <div className="h-px w-12 rounded-full bg-[var(--primary)]/35" aria-hidden />
          </div>
        ) : null}

        {items.length > 0 ? (
          <div className="bg-[#111216] pb-2 pt-0.5">
            {items.map((m) => (
              <ChatLine key={String(m.id)} msg={m} />
            ))}
          </div>
        ) : null}
      </div>

      {/* Error */}
      {chatError ? (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-3 py-2">
          <p className="text-center text-[12px] text-red-200">{chatError}</p>
          {onDismissError && (
            <button type="button" onClick={onDismissError} className="mt-1 w-full text-[11px] text-red-400 underline">Yopish</button>
          )}
        </div>
      ) : null}

      {/* Input */}
      <div className="shrink-0 border-t border-[#24262d] bg-[#111216] px-2 pb-2 pt-2">
        <div className="rounded-[12px] border-2 border-[#9147ff] bg-[#181a20] px-2.5 py-2.5 sm:px-3 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center text-zinc-300 hover:text-white" aria-label="Sovg'a">
              <GiftIcon className="h-6 w-6" />
            </button>
            <input
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Xabar yozing…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-300 outline-none placeholder:text-zinc-500 sm:text-[16px]"
            />
            <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center text-[22px] text-zinc-300 hover:text-white" aria-label="Emoji">
              ☺
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-4 text-[14px] text-zinc-400">
            <div className="flex items-center gap-1"><span>♦</span><span>0</span></div>
            <div className="flex items-center gap-1"><span>◯</span><span>{liveUserCount}</span></div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="text-[18px] text-zinc-400 hover:text-white">⚙</button>
            <button
              type="button"
              onClick={onSend}
              className="rounded-full bg-[#9147ff] px-4 py-2 text-[13px] font-bold text-white hover:brightness-110"
            >
              Чат
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
