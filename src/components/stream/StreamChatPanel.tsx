"use client";

import { useState } from "react";
import {
  Bell,
  Gift,
  Heart,
  MoreHorizontal,
  Paperclip,
  Pin,
  Send,
  Smile,
  Users,
} from "lucide-react";
import { StreamHostBadge } from "@/components/stream/StreamHostBadge";

const CHAT_NAME_COLORS = [
  "text-[#03ff93]",
  "text-[#9c5ffa]",
  "text-[#ffe50f]",
  "text-[#fc363f]",
  "text-[#5ec8ff]",
] as const;

/** Foydalanuvchi nomi uchun barqaror rang (viewer). */
export function chatUsernameColorClass(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return CHAT_NAME_COLORS[Math.abs(h) % CHAT_NAME_COLORS.length];
}

export type StreamChatPanelMessage = {
  id: string;
  user: string;
  text: string;
  userColorClass: string;
  isMe?: boolean;
  isHost?: boolean;
  badge?: string;
  withGift?: boolean;
};

export type StreamChatHistoryStatus = "loading" | "ready" | "failed";

export type StreamChatPanelProps = {
  className?: string;
  liveUserCount: number;
  socketHint?: string | null;
  chatHistoryStatus?: StreamChatHistoryStatus;
  messages: StreamChatPanelMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  chatError?: string | null;
  onChatErrorDismiss?: () => void;
  pinnedRank?: string;
  pinnedTitle?: string;
  loadingHint?: string;
  emptyHint?: string;
  inputPlaceholder?: string;
  welcomeFooter?: React.ReactNode;
};

export function StreamChatPanel({
  className = "",
  liveUserCount,
  socketHint,
  chatHistoryStatus = "ready",
  messages,
  chatInput,
  onChatInputChange,
  onSend,
  chatError,
  onChatErrorDismiss,
  pinnedRank = "7",
  pinnedTitle = "WITH AN ADDON CALLED UL...",
  loadingHint = "Chat tarixi yuklanmoqda…",
  emptyHint = "Hozircha xabar yo’q. Birinchi bo’lib yozing.",
  inputPlaceholder = "Xabar yozing…",
  welcomeFooter,
}: StreamChatPanelProps) {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <>
      <aside
        className={`flex min-h-[620px] min-w-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#141414] box-border xl:min-h-0 xl:h-full ${className}`}
      >
        <div className="flex min-h-[4.25rem] shrink-0 flex-col justify-center gap-1.5 border-b border-white/10 bg-[#16171a]/95 px-4 py-3 box-border">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <p className="truncate text-[18px] font-bold text-white shrink-0">Jonli Chat</p>
            <div className="flex shrink-0 items-center gap-2 text-[14px] text-white/65 min-w-0">
              <span className="hidden sm:inline truncate">Tomoshabinlar</span>
              <Users size={15} className="shrink-0" aria-hidden />
              <span>{liveUserCount || "—"}</span>
            </div>
          </div>
          {socketHint ? (
            <p className="text-[12px] leading-snug text-amber-400/90 min-w-0">{socketHint}</p>
          ) : null}
        </div>

        <div className="shrink-0 border-b border-white/10 bg-[#1b1c1f] px-3 py-3 box-border">
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-[#222326] px-4 py-3.5 box-border">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Pin size={15} className="shrink-0 text-white/55" aria-hidden />
              <span className="shrink-0 text-[14px] font-semibold tabular-nums text-white/60">
                {pinnedRank}
              </span>
              <p className="min-w-0 truncate text-[14px] font-semibold uppercase leading-snug text-white">
                {pinnedTitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSheet(true)}
              className="shrink-0 rounded-md p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Chat menyusi"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden box-border">
          <div className="flex min-h-min w-full min-w-0 flex-col px-3 py-2 box-border">
            {chatHistoryStatus === "loading" && messages.length === 0 ? (
              <p className="px-1 py-3 text-center text-[14px] leading-relaxed text-white/55">{loadingHint}</p>
            ) : null}
            {chatHistoryStatus !== "loading" && messages.length === 0 ? (
              <p className="px-1 py-3 text-center text-[14px] leading-relaxed text-white/45">{emptyHint}</p>
            ) : null}

            {messages.length > 0 ? (
              <div className="divide-y divide-white/[0.08]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="min-w-0 w-full box-border px-1 py-3 first:pt-2 [&:last-child]:pb-2"
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      {message.withGift ? (
                        <Gift size={14} className="shrink-0 text-[#03ff93]" aria-hidden />
                      ) : null}
                      <span
                        className={`text-[14px] font-bold leading-snug ${message.userColorClass}`}
                      >
                        {message.user}:
                      </span>
                      {message.isMe ? <StreamHostBadge variant="icon" label="Siz" /> : null}
                      {message.isHost ? <StreamHostBadge /> : null}
                      {message.badge ? (
                        <span className="inline-flex shrink-0 text-[11px] font-extrabold uppercase tracking-wide text-white/65">
                          {message.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 min-w-0 break-words text-[14px] leading-relaxed tracking-[0.01em] text-white/92">
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {welcomeFooter ? (
              <div className="min-w-0 px-1 py-4 text-white/75 box-border">{welcomeFooter}</div>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#15161a]/95 p-4 box-border">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/12 bg-[#1c1c1c] px-3 py-2 box-border">
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
                onChange={(e) => {
                  onChatInputChange(e.target.value);
                  onChatErrorDismiss?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder={inputPlaceholder}
                className="h-full min-h-0 min-w-0 flex-1 bg-transparent py-1 text-[14px] leading-snug text-white placeholder:text-white/50 outline-none box-border"
              />

              <button
                type="button"
                aria-label="Yuborish"
                onClick={onSend}
                className="shrink-0 text-white/65 transition hover:text-[#03ff93]"
              >
                <Send size={17} />
              </button>
            </div>

            <button
              type="button"
              aria-label="Like"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[#ff2d55]/35 bg-[#1c1c1c] p-0 text-[#ff2d55] transition hover:border-[#ff2d55]/55"
            >
              <Heart size={18} className="shrink-0" strokeWidth={2} />
            </button>
          </div>
          {chatError ? (
            <p className="mt-3 text-center text-[13px] leading-snug text-amber-400/95">{chatError}</p>
          ) : null}
        </div>
      </aside>

      {showSheet ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/70 p-0 md:p-6">
          <div className="w-full max-w-[430px] rounded-t-[20px] bg-[#222326] p-4 md:rounded-[20px]">
            <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-white/25" />
            <button
              type="button"
              onClick={() => setShowSheet(false)}
              className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-white"
            >
              <Bell size={18} className="text-red-500 shrink-0" />
              <span className="text-[14px] font-medium">Xabarni o&apos;chirish</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
