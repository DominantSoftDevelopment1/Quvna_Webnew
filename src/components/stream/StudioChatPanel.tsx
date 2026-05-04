"use client";

import { useEffect, useRef } from "react";

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
    <div className="group px-3 py-[5px] text-[16px] leading-[24px] hover:bg-white/[0.04]">
      {msg.reply ? (
        <div className="mb-1 ml-[54px] flex max-w-[270px] items-center rounded-[2px] border border-[#0087ff] bg-[#0c121b] px-2 py-[3px] text-[12px] text-zinc-300">
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

function TopGifters() {
  return (
    <div className="shrink-0 border-b border-[#24262d] bg-[#17181d]">
      <div className="flex items-center gap-2 border-b border-[#262832] px-3 py-2">
        <button type="button" className="text-lg text-zinc-300 hover:text-white">‹</button>
        <div className="flex min-w-0 flex-1 items-center justify-around gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-lg shadow-md shadow-black/40">👑</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] font-bold text-white">dava_black</p>
              <p className="text-[13px] font-black text-yellow-200">🎁 305</p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 opacity-95">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-zinc-400 to-zinc-700 text-sm">🥈</span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[12px] font-bold text-white">wolfking0...</p>
              <p className="text-[13px] font-black text-zinc-200">🎁 225</p>
            </div>
          </div>
        </div>
        <button type="button" className="text-lg text-zinc-300 hover:text-white">›</button>
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
}: StudioChatPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pinnedTrimmed = pinnedText.trim();

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [items.length]);

  return (
    <div className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden border border-[#303039] bg-[#111216] text-white ${className}`}>

      {/* Header */}
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-[#303039] bg-[#1f1f23] px-2">
        <div className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-100">
          <span>Moy chat</span>
          <span className="text-zinc-400">⌄</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-[12px]">◯ {liveUserCount}</span>
          <button type="button" className="text-lg leading-none hover:text-white" aria-label="Menu">⋮</button>
        </div>
      </div>

      {/* Live indicator strip */}
      <div className="h-[3px] w-5 shrink-0 bg-red-500" />

      {/* Socket hint */}
      {socketHint ? (
        <p className="shrink-0 border-b border-[#303039] px-3 py-1.5 text-[11px] text-amber-400/90">{socketHint}</p>
      ) : null}

      {/* Top Gifters */}
      <TopGifters />

      {/* Pinned */}
      {pinnedTrimmed ? (
        <div className="shrink-0 border-b border-[#24262d] bg-[#111216] px-3 py-2">
          <div className="rounded-[8px] border border-[#9147ff]/70 bg-[#191322] px-3 py-2 shadow-[inset_3px_0_0_#9147ff]">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-[11px] font-black uppercase tracking-wide text-[#bf94ff]">📌 Zakreplangan habar</span>
              <button type="button" className="text-[13px] text-zinc-400 hover:text-white">×</button>
            </div>
            <p className="text-[14px] font-semibold leading-5 text-zinc-100">{pinnedTrimmed}</p>
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div
        ref={ref}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#111216] py-1 [scrollbar-color:#4f4f57_transparent] [scrollbar-width:thin]"
      >
        {chatHistoryStatus === "loading" && items.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-zinc-500">Yuklanmoqda…</p>
        ) : null}
        {chatHistoryStatus !== "loading" && items.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-zinc-500">{emptyHint}</p>
        ) : null}
        {items.map((m) => <ChatLine key={String(m.id)} msg={m} />)}
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
        <div className="rounded-[12px] border-2 border-[#9147ff] bg-[#181a20] px-2 py-2">
          <div className="flex items-center gap-2">
            <button type="button" className="flex h-8 w-8 items-center justify-center text-zinc-300 hover:text-white" aria-label="Sovg'a">
              <GiftIcon className="h-6 w-6" />
            </button>
            <input
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Xabar yozing…"
              className="flex-1 bg-transparent text-[14px] text-zinc-300 outline-none placeholder:text-zinc-500"
            />
            <button type="button" className="flex h-8 w-8 items-center justify-center text-[22px] text-zinc-300 hover:text-white" aria-label="Emoji">
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
