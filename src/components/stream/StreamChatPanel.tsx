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

const CHAT_GUTTER_X = "px-4 sm:px-5";

const inputIconBtnClass =
  "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md text-white/65 transition hover:bg-white/10";

const studioIconBtnClass =
  "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9147ff]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#181a20]";

export function chatUsernameColorClass(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = name.charCodeAt(i) + ((h << 5) - h);
  }
  return CHAT_NAME_COLORS[Math.abs(h) % CHAT_NAME_COLORS.length];
}

export type StreamChatPanelVariant = "default" | "studio-creator";

export type StreamChatPanelMessage = {
  id: string;
  user: string;
  text: string;
  userColorClass: string;
  isMe?: boolean;
  isHost?: boolean;
  badge?: string;
  withGift?: boolean;
  avatarHref?: string;
  subtitle?: string;
  timeLabel?: string;
};

export type StreamChatHistoryStatus = "loading" | "ready" | "failed";

export type StreamChatPanelProps = {
  className?: string;
  variant?: StreamChatPanelVariant;
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
  showPinnedBar?: boolean;
  hideOuterChrome?: boolean;
};

export function StreamChatPanel({
  className = "",
  variant = "default",
  liveUserCount,
  socketHint,
  chatHistoryStatus = "ready",
  messages,
  chatInput,
  onChatInputChange,
  onSend,
  chatError,
  onChatErrorDismiss,
  pinnedRank = "",
  pinnedTitle = "",
  loadingHint = "Chat tarixi yuklanmoqda…",
  emptyHint = "Hozircha xabar yo’q. Birinchi bo’lib yozing.",
  inputPlaceholder = "Xabar yozing…",
  welcomeFooter,
  showPinnedBar = true,
  hideOuterChrome = false,
}: StreamChatPanelProps) {
  const isStudio = variant === "studio-creator";
  const embedded = isStudio && hideOuterChrome;
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

  useEffect(() => {
    if (chatHistoryStatus === "ready" && messages.length > 0) {
      scrollToBottom("instant");
    }
  }, [chatHistoryStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const pinnedTrimmed = (pinnedTitle ?? "").trim();
  const showStudioPin = isStudio && pinnedTrimmed.length > 0 && !embedded;
  const showClassicPin = !isStudio && showPinnedBar;

  const asideShell = embedded
    ? `flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden bg-transparent box-border [scrollbar-color:rgba(79,79,87,0.6)_transparent] [scrollbar-width:thin] ${className}`
    : isStudio
      ? `flex min-w-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[#111216] box-border min-h-[min(100vw,560px)] sm:min-h-[520px] xl:min-h-0 xl:h-full [scrollbar-color:rgba(79,79,87,0.6)_transparent] [scrollbar-width:thin] ${className}`
      : `flex min-w-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-white/15 bg-[#141414] box-border min-h-[min(100vw,560px)] sm:min-h-[520px] xl:min-h-0 xl:h-full ${className}`;

  return (
    <>
      <aside
        className={asideShell}
        {...(embedded ? { role: "region" as const, "aria-label": "Jonli chat" as const } : {})}
      >
        {embedded && socketHint ? (
          <p className={`shrink-0 border-b border-[var(--border)] py-2 text-[12px] leading-snug text-amber-400/90 ${CHAT_GUTTER_X}`}>
            {socketHint}
          </p>
        ) : null}
        {!embedded && isStudio ? (
          <div
            className={`flex min-h-[3rem] shrink-0 flex-col justify-center gap-2 border-b border-[var(--border)] bg-[#1f1f23] py-3 box-border ${CHAT_GUTTER_X}`}
          >
            <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <p className="min-w-0 truncate text-[15px] font-bold leading-snug text-zinc-100">Jonli chat</p>
                <ChevronDown size={16} className="shrink-0 text-zinc-500" aria-hidden />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[13px] text-zinc-300">
                  <span className="hidden max-w-[8rem] truncate sm:inline">Tomoshabinlar</span>
                  <Users size={16} className="shrink-0 text-white/55" aria-hidden />
                  <span className="tabular-nums text-white/90">{liveUserCount || "—"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSheet(true)}
                  className={`${studioIconBtnClass} border border-transparent`}
                  aria-label="Chat menyusi"
                >
                  <MoreHorizontal size={20} className="shrink-0" />
                </button>
              </div>
            </div>
            {socketHint ? (
              <p className="text-[12px] leading-snug text-amber-400/90 min-w-0">{socketHint}</p>
            ) : null}
          </div>
        ) : !embedded ? (
          <div
            className={`flex min-h-[4.25rem] shrink-0 flex-col justify-center gap-2 border-b border-white/10 bg-[#16171a]/95 py-3.5 box-border ${CHAT_GUTTER_X}`}
          >
            <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-4">
              <p className="min-w-0 flex-1 truncate pl-0.5 text-[18px] font-bold leading-snug text-white">Jonli Chat</p>
              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[14px] text-white/65">
                <span className="hidden sm:inline max-w-[9rem] truncate">Tomoshabinlar</span>
                <Users size={15} className="shrink-0 text-white/55" aria-hidden />
                <span className="tabular-nums">{liveUserCount || "—"}</span>
              </div>
            </div>
            {socketHint ? (
              <p className="text-[12px] leading-snug text-amber-400/90 min-w-0">{socketHint}</p>
            ) : null}
          </div>
        ) : null}

        {showStudioPin ? (
          <div className={`shrink-0 border-b border-[var(--border)] bg-[#111216] py-3 box-border ${CHAT_GUTTER_X}`}>
            <div className="rounded-lg border border-[#9147ff]/45 bg-[#0c1210] px-4 py-3 shadow-[inset_3px_0_0_#9147ff]">
              <div className="mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#9147ff]">Qadalgan xabar</span>
              </div>
              <p className="m-0 text-[14px] font-semibold leading-relaxed text-zinc-100">{pinnedTrimmed}</p>
              {pinnedRank ? (
                <p className="mt-2 text-[12px] font-semibold tabular-nums text-zinc-500">{pinnedRank}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {showClassicPin ? (
          <div className={`mt-2 shrink-0 border-y border-white/10 bg-[#1b1c1f] py-3 box-border ${CHAT_GUTTER_X}`}>
            <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-lg bg-[#222326] px-3.5 py-3 sm:gap-4 sm:px-4 sm:py-3.5 box-border">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
                <Pin size={15} className="shrink-0 text-white/55" aria-hidden />
                {pinnedRank ? (
                  <span className="shrink-0 text-[13px] font-semibold tabular-nums text-white/55">{pinnedRank}</span>
                ) : null}
                <p className="min-w-0 flex-1 text-[14px] font-semibold leading-snug text-white line-clamp-2 normal-case">
                  {(pinnedTitle ?? "").trim() ||
                    "Qadama xabar — stream nomi yoki e’lon shu yerda ko‘rinadi"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSheet(true)}
                className="shrink-0 rounded-md p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03ff93]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#222326]"
                aria-label="Chat menyusi"
              >
                <MoreHorizontal size={17} className="shrink-0" />
              </button>
            </div>
          </div>
        ) : null}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden box-border ${isStudio ? "mt-1" : "mt-4"}`}
        >
          <div className={`flex min-h-min w-full min-w-0 flex-col pb-6 pt-4 box-border ${CHAT_GUTTER_X}`}>
            {chatHistoryStatus === "loading" && messages.length === 0 ? (
              <p className="py-3 text-center text-[14px] leading-relaxed text-white/55">{loadingHint}</p>
            ) : null}
            {chatHistoryStatus !== "loading" && messages.length === 0 ? (
              <p className="py-3 text-center text-[14px] leading-relaxed text-white/45">{emptyHint}</p>
            ) : null}

            {messages.length > 0 ? (
              <div className={`flex flex-col ${isStudio ? "gap-2.5 sm:gap-3" : "gap-2 sm:gap-2.5"}`}>
                {messages.map((message) => {
                  const av = message.avatarHref?.trim();
                  const avSrc = av ? (av.startsWith("http") ? av : cdnUrl(av)) : null;
                  const initial = (message.user || "?").trim().charAt(0).toUpperCase() || "?";
                  const hasBadges = Boolean(message.isMe || message.isHost || message.badge);

                  if (isStudio) {
                    const timeCol = message.timeLabel ?? "—";
                    return (
                      <div
                        key={message.id}
                        className="min-w-0 w-full rounded-lg px-0 py-2.5 transition hover:bg-white/[0.04] sm:py-3"
                      >
                        <div className="flex min-w-0 gap-2 sm:gap-3">
                          <span className="w-[3.25rem] shrink-0 pt-1 text-right text-[11px] tabular-nums leading-snug text-zinc-500">
                            {timeCol}
                          </span>
                          <div className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/12 bg-[#2a2b2f]">
                            {avSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-[12px] font-bold text-white/75">
                                {initial}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                              {message.withGift ? (
                                <Gift size={16} className="shrink-0 text-[#9147ff]" aria-hidden />
                              ) : null}
                              <span
                                className={`min-w-0 break-words text-[15px] font-bold leading-snug ${message.userColorClass}`}
                              >
                                {message.user}
                                <span className="font-bold text-zinc-500">:</span>
                              </span>
                            </div>
                            {hasBadges ? (
                              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                                {message.isMe ? <StreamHostBadge variant="icon" label="Siz" /> : null}
                                {message.isHost ? <StreamHostBadge label="Brilyant" tone="yellow" /> : null}
                                {message.badge ? (
                                  <span className="inline-flex max-w-full rounded border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                                    {message.badge}
                                  </span>
                                ) : null}
                              </div>
                            ) : null}
                            {message.subtitle ? (
                              <p className="text-[12px] leading-snug text-white/45 line-clamp-2">{message.subtitle}</p>
                            ) : null}
                            <p className="min-w-0 break-words text-[15px] leading-relaxed text-zinc-100">{message.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className="min-w-0 w-full rounded-lg px-1 py-2.5 transition hover:bg-white/[0.02] sm:px-0 sm:py-3"
                    >
                      <div className="flex min-w-0 gap-3">
                        <div className="mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/12 bg-[#2a2b2f]">
                          {avSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avSrc} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[12px] font-bold text-white/75">
                              {initial}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
                          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            {message.withGift ? (
                              <Gift size={15} className="shrink-0 text-[#03ff93]" aria-hidden />
                            ) : null}
                            <span
                              className={`min-w-0 break-words text-[15px] font-semibold leading-snug ${message.userColorClass}`}
                            >
                              {message.user}
                            </span>
                          </div>
                          {hasBadges ? (
                            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5">
                              {message.isMe ? <StreamHostBadge variant="icon" label="Siz" /> : null}
                              {message.isHost ? <StreamHostBadge label="Brilyant" tone="yellow" /> : null}
                              {message.badge ? (
                                <span className="inline-flex max-w-full rounded border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                                  {message.badge}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          {message.subtitle ? (
                            <p className="text-[12px] leading-snug text-white/45 line-clamp-2">{message.subtitle}</p>
                          ) : null}
                          <p className="min-w-0 break-words pt-0.5 text-[14px] leading-relaxed text-white/[0.92]">
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
              <div className="min-w-0 border-t border-white/10 py-5 text-white/75 box-border">{welcomeFooter}</div>
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

        {isStudio ? (
          <div className={`shrink-0 border-t border-[var(--border)] bg-[#111216] py-4 sm:py-5 box-border ${CHAT_GUTTER_X}`}>
            <div className="rounded-xl border-2 border-[#9147ff]/50 bg-[#181a20] px-3 py-3 sm:px-4 box-border">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  disabled
                  title="Tez orada"
                  aria-label="Sovg'a (tez orada)"
                  className={`${studioIconBtnClass} cursor-not-allowed opacity-45 hover:bg-transparent`}
                >
                  <Gift size={22} className="shrink-0" />
                </button>
                <button
                  type="button"
                  disabled
                  title="Tez orada"
                  aria-label="Emoji (tez orada)"
                  className={`${studioIconBtnClass} cursor-not-allowed opacity-45 hover:bg-transparent`}
                >
                  <Smile size={22} className="shrink-0" />
                </button>
                <button
                  type="button"
                  disabled
                  title="Tez orada"
                  aria-label="Ulashish (tez orada)"
                  className={`${studioIconBtnClass} cursor-not-allowed opacity-45 hover:bg-transparent`}
                >
                  <Paperclip size={22} className="shrink-0" />
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
                  className="h-11 min-h-11 min-w-0 flex-1 bg-transparent px-2 text-[14px] leading-snug text-zinc-100 placeholder:text-zinc-500 outline-none focus-visible:ring-0 box-border"
                />

                <button
                  type="button"
                  aria-label="Yuborish"
                  onClick={onSend}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full !bg-[#9147ff] px-5 text-[13px] font-bold !text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9147ff]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#181a20]"
                >
                  <Send size={18} className="shrink-0 sm:hidden" />
                  <span className="hidden sm:inline">Yuborish</span>
                </button>
              </div>
            </div>
            {chatError ? (
              <p className="mt-3 text-center text-[13px] leading-snug text-amber-400/95">{chatError}</p>
            ) : null}
          </div>
        ) : (
          <div className={`shrink-0 border-t border-white/10 bg-[#15161a]/95 py-4 sm:py-5 box-border ${CHAT_GUTTER_X}`}>
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-12 min-h-12 min-w-0 flex-1 items-center gap-1 rounded-lg border border-white/12 bg-[#1c1c1c] px-2.5 py-2 sm:gap-1.5 sm:px-3 box-border">
                <button
                  type="button"
                  disabled
                  title="Tez orada"
                  aria-label="Sovg'a (tez orada)"
                  className={`${inputIconBtnClass} cursor-not-allowed opacity-45 hover:bg-transparent hover:text-white/65`}
                >
                  <Gift size={18} className="shrink-0" />
                </button>
                <button
                  type="button"
                  disabled
                  title="Tez orada"
                  aria-label="Emoji (tez orada)"
                  className={`${inputIconBtnClass} cursor-not-allowed opacity-45 hover:bg-transparent hover:text-white/65`}
                >
                  <Smile size={18} className="shrink-0" />
                </button>
                <button
                  type="button"
                  disabled
                  title="Tez orada"
                  aria-label="Ulashish (tez orada)"
                  className={`${inputIconBtnClass} cursor-not-allowed opacity-45 hover:bg-transparent hover:text-white/65`}
                >
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
                  className="h-full min-h-0 min-w-0 flex-1 bg-transparent px-1 py-1 text-[14px] leading-snug text-white placeholder:text-white/50 outline-none focus-visible:ring-0 box-border"
                />

                <button
                  type="button"
                  aria-label="Yuborish"
                  onClick={onSend}
                  className={`${inputIconBtnClass} hover:text-[#03ff93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#03ff93]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1c]`}
                >
                  <Send size={17} className="shrink-0" />
                </button>
              </div>

              <button
                type="button"
                disabled
                title="Tez orada"
                aria-label="Like (tez orada)"
                className="inline-flex h-12 min-h-12 min-w-12 shrink-0 cursor-not-allowed items-center justify-center rounded-lg border border-[#ff2d55]/25 bg-[#1c1c1c] p-0 text-[#ff2d55]/45 opacity-80"
              >
                <Heart size={18} className="shrink-0" strokeWidth={2} />
              </button>
            </div>
            {chatError ? (
              <p className="mt-3 text-center text-[13px] leading-snug text-amber-400/95">{chatError}</p>
            ) : null}
          </div>
        )}
      </aside>

      {showSheet ? (
        <div className="fixed inset-0 z-40 grid place-items-end bg-black/70 p-0 md:p-6">
          <div className="w-full max-w-[430px] rounded-t-[20px] bg-[#222326] p-5 pb-6 md:rounded-[20px] md:p-6">
            <div className="mx-auto mb-4 h-1 w-8 rounded-full bg-white/25" />
            <button
              type="button"
              onClick={() => setShowSheet(false)}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-white transition hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
