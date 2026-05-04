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
};

const AVATAR_COLORS = [
  "bg-[#9147ff]", "bg-[#00b5ad]", "bg-[#e91e8c]",
  "bg-[#fa8231]", "bg-[#0abde3]", "bg-[#10ac84]",
];

function avatarBg(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

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
  const initial = (msg.user || "?").trim().charAt(0).toUpperCase();
  const bg = avatarBg(msg.user);

  return (
    <div className="group flex min-w-0 items-start gap-2 px-3 py-[5px] hover:bg-white/[0.04]">
      {/* Vaqt */}
      <span className="w-[36px] shrink-0 pt-[3px] text-[11px] leading-none text-zinc-600">
        {msg.time ?? ""}
      </span>

      {/* Avatar */}
      <div className={`mt-[1px] h-7 w-7 shrink-0 overflow-hidden rounded-full ${bg}`}>
        {msg.avatarHref ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={msg.avatarHref} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px] font-extrabold text-white/90">
            {initial}
          </div>
        )}
      </div>

      {/* Kontent */}
      <div className="min-w-0 flex-1 pt-[1px]">
        <p className="min-w-0 break-words text-[14px] leading-[1.55]">
          {msg.badge ? (
            <span className="mr-0.5 text-[13px]">{msg.badge} </span>
          ) : null}
          <span className={`font-bold ${msg.color || "text-[#00b5ad]"}`}>
            {msg.user}:{" "}
          </span>
          <span className="text-zinc-100">{msg.text}</span>
        </p>
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
    <div className={`flex h-full max-h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[#111216] text-white ${className}`}>

      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#303039] bg-[#1f1f23] px-4">
        <b className="text-[14px] font-semibold">Moy chat</b>
        <button type="button" className="text-zinc-400 hover:text-white" aria-label="Yana">⋮</button>
      </div>

      {/* Socket hint */}
      {socketHint ? (
        <p className="shrink-0 border-b border-[#303039] px-4 py-2.5 text-[11px] text-amber-400/90">{socketHint}</p>
      ) : null}

      {/* Leaderboard */}
      <div className="shrink-0 border-b border-[#24262d] bg-[#17181d] px-4 py-3">
        <div className="flex min-w-0 items-center justify-around gap-3">
          <span className="min-w-0 truncate text-[13px] font-semibold text-zinc-200">👑 dava_black 🎁 305</span>
          <span className="min-w-0 truncate text-[13px] font-semibold text-zinc-200">🥈 wolfking0 🎁 225</span>
        </div>
      </div>

      {/* Pinned */}
      {pinnedTrimmed ? (
        <div className="shrink-0 border-b border-[#24262d] bg-[#111216] px-4 py-3">
          <div className="rounded-[8px] border border-[#9147ff]/70 bg-[#191322] px-3 py-2.5">
            <p className="mb-1 text-[11px] font-black uppercase text-[#bf94ff]">📌 Zakreplangan habar</p>
            <p className="text-[13px] font-semibold leading-snug text-zinc-100">{pinnedTrimmed}</p>
          </div>
        </div>
      ) : null}

      {/* Messages */}
      <div
        ref={ref}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-1 [scrollbar-color:rgba(79,79,87,0.55)_transparent] [scrollbar-width:thin]"
      >
        {chatHistoryStatus === "loading" && items.length === 0 ? (
          <p className="px-4 py-5 text-center text-sm text-zinc-500">Yuklanmoqda…</p>
        ) : null}
        {chatHistoryStatus !== "loading" && items.length === 0 ? (
          <p className="px-4 py-5 text-center text-sm text-zinc-500">{emptyHint}</p>
        ) : null}
        {items.map((m) => <ChatLine key={String(m.id)} msg={m} />)}
      </div>

      {/* Error */}
      {chatError ? (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-2.5">
          <p className="text-center text-[12px] text-red-200">{chatError}</p>
          {onDismissError ? (
            <button type="button" onClick={onDismissError} className="mt-1 w-full text-[11px] text-red-300 underline">Yopish</button>
          ) : null}
        </div>
      ) : null}

      {/* Input */}
      <div className="shrink-0 border-t border-[#24262d] px-3 pb-3 pt-3">
        <div className="rounded-[10px] border-2 border-[#9147ff] bg-[#181a20] px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center text-zinc-400 hover:text-zinc-200" aria-label="Sovg'a">
              <GiftIcon className="h-5 w-5" />
            </button>
            <input
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
              placeholder="Xabar yozing…"
              className="min-h-0 min-w-0 flex-1 bg-transparent text-[14px] text-zinc-200 outline-none placeholder:text-zinc-500"
            />
            <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center text-[20px] text-zinc-400" aria-hidden>☺</span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 px-1">
          <span className="text-sm text-zinc-400">♦ 0 <span className="mx-1 text-zinc-600">|</span>◯ {liveUserCount}</span>
          <button type="button" onClick={onSend} className="shrink-0 rounded-full bg-[#9147ff] px-5 py-1.5 text-[13px] font-bold text-white transition hover:brightness-110">
            Yuborish
          </button>
        </div>
      </div>
    </div>
  );
}
