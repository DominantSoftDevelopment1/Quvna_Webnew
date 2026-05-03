"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bell,
  ChevronDown,
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
import { cdnUrl } from "@/lib/utils";

const CHAT_NAME_COLORS = [
  "text-[#03ff93]",
  "text-[#9c5ffa]",
  "text-[#ffe50f]",
  "text-[#fc363f]",
  "text-[#5ec8ff]",
] as const;

/** Chat panel ichidagi bitta gorizontal gutter (parent-first). */
const CHAT_GUTTER_X = "px-6";

const inputIconBtnClass =
  "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md text-white/65 transition hover:bg-white/10";

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
  /** Backend profil / chat DTO — avatar path yoki URL */
  avatarHref?: string;
  /** Nickname, o‘yin UID va h.k. */
  subtitle?: string;
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
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(messages.length);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
    setUserScrolledUp(false);
    setUnreadCount(0);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom > 80) {
      setUserScrolledUp(true);
    } else {
      setUserScrolledUp(false);
      setUnreadCount(0);
    }
  }, []);

  // Yangi xabar kelganda scroll yoki unread counter
  useEffect(() => {
    const newCount = messages.length;
    const added = newCount - prevMsgCount.current;
    prevMsgCount.current = newCount;
    if (added <= 0) return;
    if (userScrolledUp) {
      setUnreadCount((c) => c + added);
    } else {
      scrollToBottom("smooth");
    }
  }, [messages.length, userScrolledUp, scrollToBottom]);

  // Birinchi yuklashda pastga tush
  useEffect(() => {
    if (chatHistoryStatus === "ready" && messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [chatHistoryStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <aside
        className={`flex min-w-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#141414] box-border min-h-[620px] xl:min-h-0 xl:h-full ${className}`}
      >
        <div
          className={`flex min-h-[4.25rem] shrink-0 flex-col justify-center gap-1.5 border-b border-white/10 bg-[#16171a]/95 py-3 box-border ${CHAT_GUTTER_X}`}
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate text-[18px] font-bold text-white">Jonli Chat</p>
            <div className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[14px] text-white/65">
              <span className="hidden sm:inline truncate">Tomoshabinlar</span>
              <Users size={15} className="shrink-0" aria-hidden />
              <span>{liveUserCount || "—"}</span>
            </div>
          </div>
          {socketHint ? (
            <p className="text-[12px] leading-snug text-amber-400/90 min-w-0">{socketHint}</p>
          ) : null}
        </div>

        <div className={`mt-3 shrink-0 border-y border-white/10 bg-[#1b1c1f] py-3 box-border ${CHAT_GUTTER_X}`}>
          <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg bg-[#222326] px-4 py-3.5 box-border">
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
              className="shrink-0 rounded-md p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Chat menyusi"
            >
              <MoreHorizontal size={17} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative mt-4 min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden box-border"
        >
          <div className={`flex min-h-min w-full min-w-0 flex-col pb-5 pt-4 box-border ${CHAT_GUTTER_X}`}>
            {chatHistoryStatus === "loading" && messages.length === 0 ? (
              <p className="py-3 text-center text-[14px] leading-relaxed text-white/55">{loadingHint}</p>
            ) : null}
            {chatHistoryStatus !== "loading" && messages.length === 0 ? (
              <p className="py-3 text-center text-[14px] leading-relaxed text-white/45">{emptyHint}</p>
            ) : null}

            {messages.length > 0 ? (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const av = message.avatarHref?.trim();
                  const avSrc = av ? (av.startsWith("http") ? av : cdnUrl(av)) : null;
                  const initial = (message.user || "?").trim().charAt(0).toUpperCase() || "?";
                  return (
                    <div
                      key={message.id}
                      className="min-w-0 w-full box-border py-1"
                    >
                      <div className="flex min-w-0 gap-2.5">
                        <div className="mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/12 bg-[#2a2b2f]">
                          {avSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[11px] font-extrabold text-white/70">
                              {initial}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
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
                            {message.isHost ? <StreamHostBadge label="Brilyant" tone="yellow" /> : null}
                            {message.badge ? (
                              <span className="inline-flex shrink-0 text-[11px] font-extrabold uppercase tracking-wide text-white/65">
                                {message.badge}
                              </span>
                            ) : null}
                          </div>
                          {message.subtitle ? (
                            <p className="mt-0.5 text-[11px] leading-snug text-white/45 line-clamp-2">
                              {message.subtitle}
                            </p>
                          ) : null}
                          <p className="mt-1 min-w-0 break-words text-[14px] leading-relaxed tracking-[0.01em] text-white/92">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}

            {welcomeFooter ? (
              <div className="min-w-0 py-4 text-white/75 box-border">{welcomeFooter}</div>
            ) : null}

            <div ref={bottomRef} className="h-0 w-full shrink-0" aria-hidden />
          </div>

          {userScrolledUp ? (
            <div className="sticky bottom-3 flex justify-center pointer-events-none">
              <button
                type="button"
                onClick={() => scrollToBottom("smooth")}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#1e1f23]/95 px-3 py-1.5 text-[12px] font-bold text-white/90 shadow-lg backdrop-blur-sm transition hover:bg-[#2a2b30]"
              >
                <ChevronDown size={13} className="shrink-0" />
                {unreadCount > 0 ? `${unreadCount} yangi xabar` : "Pastga"}
              </button>
            </div>
          ) : null}
        </div>

        <div className={`shrink-0 border-t border-white/10 bg-[#15161a]/95 py-4 box-border ${CHAT_GUTTER_X}`}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 min-h-12 min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-white/12 bg-[#1c1c1c] px-4 py-2 box-border">
              <button type="button" aria-label="Sovg'a" className={`${inputIconBtnClass} hover:text-white`}>
                <Gift size={18} className="shrink-0" />
              </button>
              <button type="button" aria-label="Emoji" className={`${inputIconBtnClass} hover:text-white`}>
                <Smile size={18} className="shrink-0" />
              </button>
              <button type="button" aria-label="Ulashish" className={`${inputIconBtnClass} hover:text-white`}>
                <Paperclip size={18} className="shrink-0" />
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
                className={`${inputIconBtnClass} hover:text-[#03ff93]`}
              >
                <Send size={17} className="shrink-0" />
              </button>
            </div>

            <button
              type="button"
              aria-label="Like"
              className="inline-flex h-12 min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-[#ff2d55]/35 bg-[#1c1c1c] p-0 text-[#ff2d55] transition hover:border-[#ff2d55]/55"
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
