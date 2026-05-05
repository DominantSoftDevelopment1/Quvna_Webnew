"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Settings, Users, Gift, Smile } from "lucide-react";

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
  isMe?: boolean;
};

function ChatLine({ msg }: { msg: StudioChatItem }) {
  const userColors = [
    "text-[#ff7f50]",
    "text-[#00ff7f]",
    "text-[#1e90ff]",
    "text-[#ff69b4]",
    "text-[#9147ff]",
    "text-[#00b5ad]",
    "text-[#ffd700]",
    "text-[#ff4500]",
  ];
  
  const colorIndex = msg.user.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % userColors.length;
  const userColor = msg.isHost ? "text-[#9147ff]" : msg.color || userColors[colorIndex];

  return (
    <div className={`group flex items-start gap-2 px-3 py-1.5 hover:bg-white/[0.03] ${msg.isMe ? "bg-[#9147ff]/5" : ""}`}>
      {/* Avatar */}
      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
        msg.isHost 
          ? "bg-gradient-to-br from-[#9147ff] to-[#772ce8] text-white" 
          : "bg-[#2f2f35] text-[#adadb8]"
      }`}>
        {msg.user.charAt(0).toUpperCase()}
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          {/* Badges */}
          {msg.isHost && (
            <span className="rounded bg-[#9147ff] px-1 py-0.5 text-[9px] font-bold uppercase text-white">
              HOST
            </span>
          )}
          
          {/* Username */}
          <span className={`text-sm font-semibold ${userColor}`}>
            {msg.user}
          </span>
          
          {/* Time */}
          {msg.time && (
            <span className="text-[10px] text-[#53535f]">{msg.time}</span>
          )}
        </div>
        
        {/* Message */}
        <p className="break-words text-sm text-[#efeff1]">{msg.text}</p>
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
  emptySubhint = "Jonli efir boshlangach bu yerda muloqot ko'rinadi.",
}: StudioChatPanelProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pinnedTrimmed = pinnedText.trim();
  const [pinnedExpanded, setPinnedExpanded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setPinnedExpanded(false));
  }, [pinnedTrimmed]);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [items.length]);

  return (
    <div className={`flex flex-col overflow-hidden bg-[#18181b] text-[#efeff1] ${className}`}>
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#2f2f35] px-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-[#9147ff]" />
          <span className="text-sm font-bold">Stream Chat</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#adadb8]">
            <Users size={14} />
            <span className="text-xs font-medium">{liveUserCount}</span>
          </div>
          <button className="text-[#adadb8] transition hover:text-white">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Socket hint */}
      {socketHint && (
        <div className="flex items-center gap-2 border-b border-[#2f2f35] bg-amber-500/10 px-3 py-2">
          <Loader2 size={14} className="animate-spin text-amber-400" />
          <p className="text-xs text-amber-400">{socketHint}</p>
        </div>
      )}

      {/* Pinned message */}
      {pinnedTrimmed && (
        <div className="shrink-0 border-b border-[#2f2f35] bg-[#1f1f23] p-3">
          <button
            onClick={() => setPinnedExpanded(!pinnedExpanded)}
            className="w-full text-left"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9147ff]">
                Zakreplangan
              </span>
            </div>
            <p className={`text-sm text-[#efeff1] ${pinnedExpanded ? "" : "line-clamp-2"}`}>
              {pinnedTrimmed}
            </p>
          </button>
        </div>
      )}

      {/* Messages area */}
      <div
        ref={ref}
        className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-color:rgba(79,79,87,0.55)_transparent] [scrollbar-width:thin]"
      >
        {chatHistoryStatus === "loading" && items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f2f35]">
              <Loader2 className="h-6 w-6 animate-spin text-[#9147ff]" />
            </div>
            <p className="text-sm text-[#adadb8]">Chat tarixi yuklanmoqda...</p>
          </div>
        ) : null}

        {chatHistoryStatus !== "loading" && items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2f2f35]">
              <MessageCircle className="h-8 w-8 text-[#53535f]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#adadb8]">{emptyHint}</p>
              {emptySubhint && (
                <p className="mt-1 text-xs text-[#53535f]">{emptySubhint}</p>
              )}
            </div>
          </div>
        ) : null}

        {items.length > 0 && (
          <div className="py-2">
            {items.map((m) => (
              <ChatLine key={String(m.id)} msg={m} />
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {chatError && (
        <div className="shrink-0 border-t border-red-500/20 bg-red-500/10 px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-400">{chatError}</p>
            {onDismissError && (
              <button onClick={onDismissError} className="text-xs text-red-400 hover:underline">
                Yopish
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-[#2f2f35] p-3">
        <div className="flex items-center gap-2 rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-3 py-2 focus-within:border-[#9147ff]">
          <input
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Xabar yozing..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#53535f]"
          />
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white">
              <Smile size={18} />
            </button>
            <button
              onClick={onSend}
              disabled={!chatInput.trim()}
              className="flex h-8 w-8 items-center justify-center rounded bg-[#9147ff] text-white transition hover:bg-[#772ce8] disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
