"use client";

import { useEffect, useRef } from "react";

export type StudioChatItem = {
  id: string | number;
  user: string;
  text: string;
  color?: string;
  avatarHref?: string;
  isHost?: boolean;
};

function GiftIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 10h16v10H4V10Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 6h18v4H3V6Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v14" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ChatLine({ msg }: { msg: StudioChatItem }) {
  return (
    <div className="min-w-0 px-4 py-[4px] hover:bg-white/[0.03]">
      <p className="min-w-0 break-words text-[14px] leading-[1.6]">
        <span className={`font-semibold ${msg.color || "text-[#00b5ad]"}`}>{msg.user}</span>
        <span className="text-zinc-500">: </span>
        <span className="text-zinc-100">{msg.text}</span>
      </p>
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
    <div className={`flex h-full max-h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#111216] text-white ${className}`}>

      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#303039] bg-[#1f1f23] px-4">
        <span className="text-[14px] font-semibold text-zinc-100">Jonli chat</span>
        <div className="flex items-center gap-3">
          {liveUserCount > 0 && (
            <span className="text-[12px] text-zinc-500">◯ {liveUserCount}</span>
          )}
          <button type="button" className="text-zinc-500 hover:text-white" aria-label="Yana">⋮</button>
        </div>
      </div>

      {/* Socket hint */}
      {socketHint ? (
        <p className="shrink-0 border-b border-[#303039] px-4 py-2 text-[11px] text-amber-400/90">{socketHint}</p>
      ) : null}

      {/* Pinned — kompakt */}
      {pinnedTrimmed ? (
        <div className="shrink-0 border-b border-[#24262d] px-4 py-2">
          <div className="flex min-w-0 items-start gap-2 rounded-md bg-[#1f1f23] px-3 py-2">
            <span className="mt-0.5 shrink-0 text-[12px] text-[#bf94ff]">📌</span>
            <p className="min-w-0 line-clamp-2 text-[13px] leading-snug text-zinc-200">{pinnedTrimmed}</p>
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div
        ref={ref}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1 [scrollbar-color:rgba(79,79,87,0.55)_transparent] [scrollbar-width:thin]"
      >
        {chatHistoryStatus === "loading" && items.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-zinc-600">Yuklanmoqda…</p>
        ) : null}
        {chatHistoryStatus !== "loading" && items.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-zinc-600">{emptyHint}</p>
        ) : null}
        {items.map((m) => <ChatLine key={String(m.id)} msg={m} />)}
      </div>

      {/* Error */}
      {chatError ? (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-2">
          <p className="text-center text-[12px] text-red-300">{chatError}</p>
          {onDismissError && (
            <button type="button" onClick={onDismissError} className="mt-1 w-full text-[11px] text-red-400 underline">Yopish</button>
          )}
        </div>
      ) : null}

      {/* Input */}
      <div className="shrink-0 border-t border-[#24262d] px-3 pb-3 pt-3">
        <div className="rounded-[10px] border border-[#9147ff]/60 bg-[#181a20] px-3 py-2.5 focus-within:border-[#9147ff]">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center text-zinc-500 hover:text-zinc-300" aria-label="Sovg'a">
              <GiftIcon className="h-5 w-5" />
            </button>
            <input
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Xabar yozing…"
              className="min-h-0 min-w-0 flex-1 bg-transparent text-[14px] text-zinc-200 outline-none placeholder:text-zinc-600"
            />
            <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center text-zinc-500 hover:text-zinc-300" aria-label="Emoji">
              <span className="text-[18px]">☺</span>
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onSend}
            className="rounded-full bg-[#9147ff] px-5 py-1.5 text-[13px] font-bold text-white transition hover:bg-[#a970ff]"
          >
            Yuborish
          </button>
        </div>
      </div>
    </div>
  );
}
