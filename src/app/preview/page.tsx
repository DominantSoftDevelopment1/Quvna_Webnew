"use client";

import React, { useEffect, useRef, useState } from "react";

// Twitch/Quvna Studio layout — dizayn preview (mock ma’lumot)
// React + Tailwind

type ChatSeedItem = {
  id: number;
  user: string;
  text: string;
  badge: string;
  color: string;
  time: string;
  reply?: string;
};

const chatSeed: ChatSeedItem[] = [
  {
    id: 1,
    user: "Queeeen1",
    text: "WITH AN ADDON CALLED Ultra Hardcore...",
    badge: "👑",
    color: "text-yellow-300",
    time: "08:45",
    reply: "WITH AN ADDON CALLED UL...",
  },
  {
    id: 2,
    user: "GrayShoot",
    text: "Men, fantastik prikoooo! 🔥🔥",
    badge: "🪄",
    color: "text-fuchsia-400",
    time: "08:45",
  },
  {
    id: 3,
    user: "Ranger",
    text: "That was insane dude...",
    badge: "🟢",
    color: "text-lime-400",
    time: "08:45",
  },
];

function Panel({
  title,
  children,
  className = "",
  right,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <section className={`flex min-h-0 flex-col border border-[#303039] bg-[#18181b] ${className}`}>
      <div className="flex min-h-10 shrink-0 items-center justify-between border-b border-[#303039] bg-[#1f1f23] px-3 py-2">
        <div className="flex items-center gap-2 text-[13px] font-bold text-zinc-100">
          <span>{title}</span>
          <span className="text-zinc-400" aria-hidden>
            ⌄
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          {right}
          <button
            type="button"
            className="min-h-9 min-w-9 rounded text-lg leading-none hover:bg-white/10 hover:text-white"
            aria-label="Yana"
          >
            ⋮
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

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

function ChatLine({ msg }: { msg: ChatSeedItem }) {
  return (
    <div className="group px-3 py-2 text-[16px] leading-6 hover:bg-white/[0.04]">
      {msg.reply ? (
        <div className="mb-1 ml-[54px] flex max-w-[270px] items-center rounded border border-[#0087ff] bg-[#0c121b] px-2 py-1 text-[12px] text-zinc-300">
          <span className="mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">
            T
          </span>
          <span className="truncate">{msg.reply}</span>
        </div>
      ) : null}

      <div className="flex min-w-0 items-start gap-2">
        <span className="w-[38px] shrink-0 pt-0.5 text-[11px] tabular-nums text-zinc-500">{msg.time}</span>
        <span className="shrink-0 pt-0.5 text-[18px] leading-none" aria-hidden>
          {msg.badge}
        </span>
        <span className={`shrink-0 font-bold ${msg.color}`}>{msg.user}:</span>
        <span className="min-w-0 break-words text-zinc-100">{msg.text}</span>
      </div>
    </div>
  );
}

function TopGifters() {
  return (
    <div className="shrink-0 border-b border-[#24262d] bg-[#17181d]">
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" className="min-h-9 min-w-9 text-lg text-zinc-300 hover:text-white" aria-label="Oldingi">
          ‹
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-around gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 text-lg">
              👑
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-white">dava_black</p>
              <p className="text-[13px] font-black text-yellow-200">🎁 305</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-700 text-sm">🥈</span>
            <div className="min-w-0">
              <p className="truncate text-[12px] font-bold text-white">wolfking0...</p>
              <p className="text-[13px] font-black text-zinc-200">🎁 225</p>
            </div>
          </div>
        </div>

        <button type="button" className="min-h-9 min-w-9 text-lg text-zinc-300 hover:text-white" aria-label="Keyingi">
          ›
        </button>
      </div>
    </div>
  );
}

function PinnedMessage() {
  return (
    <div className="shrink-0 border-b border-[#24262d] bg-[#111216] px-3 py-2">
      <div className="rounded-lg border border-[var(--primary)]/55 bg-[#0c1210] px-3 py-2 shadow-[inset_3px_0_0_var(--primary)]">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--primary)]">Qadalgan xabar</span>
          <button type="button" className="min-h-9 min-w-9 text-zinc-400 hover:text-white" aria-label="Yopish">
            ×
          </button>
        </div>
        <p className="text-[14px] font-semibold leading-snug text-zinc-100">
          Bugungi efirda spam yo‘q. Sovg‘a yuborgan top viewerlar yuqorida ko‘rinadi.
        </p>
      </div>
    </div>
  );
}

function ChatPanel() {
  const [items, setItems] = useState<ChatSeedItem[]>(chatSeed);
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [items.length]);

  function send() {
    const v = text.trim();
    if (!v) return;

    setItems((p) => [
      ...p,
      {
        id: Date.now(),
        user: "uranrp",
        text: v,
        badge: "🟦",
        color: "text-cyan-400",
        time: new Date().toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setText("");
  }

  return (
    <Panel title="Mening chat" className="box-border flex min-h-[min(100dvh,520px)] flex-1 flex-col bg-[#111216] lg:h-full lg:min-h-0">
      <div className="h-[3px] w-5 bg-red-500" aria-hidden />

      <TopGifters />
      <PinnedMessage />

      <div ref={ref} className="min-h-0 flex-1 overflow-y-auto bg-[#111216] py-1 [scrollbar-color:rgba(79,79,87,0.5)_transparent] [scrollbar-width:thin]">
        {items.map((m) => (
          <ChatLine key={m.id} msg={m} />
        ))}
      </div>

      <div className="shrink-0 border-t border-[#24262d] bg-[#111216] px-3 pb-3 pt-2">
        <div className="rounded-xl border-2 border-[var(--primary)]/50 bg-[#181a20] px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-zinc-300 hover:text-white"
              aria-label="Sovg‘a"
            >
              <GiftIcon className="h-6 w-6" />
            </button>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Xabar yuborish…"
              className="min-h-11 min-w-0 flex-1 bg-transparent text-[14px] text-zinc-200 outline-none placeholder:text-zinc-500"
            />

            <button
              type="button"
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-[22px] text-zinc-300 hover:text-white"
              aria-label="Emoji"
            >
              ☺
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-0.5">
          <div className="flex items-center gap-4 text-[14px] text-zinc-400">
            <span>♦ 0</span>
            <span>◯ 20</span>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="min-h-11 min-w-11 text-[18px] text-zinc-400 hover:text-white" aria-label="Sozlamalar">
              ⚙
            </button>
            <button
              type="button"
              onClick={send}
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-[13px] font-bold text-[var(--primary-text)] hover:brightness-110"
            >
              Chat
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function StreamPreview() {
  const [isLive, setIsLive] = useState(false);

  return (
    <Panel
      title="Efir oldko‘rinishi"
      className="min-h-[280px] flex-1 lg:min-h-[420px] lg:max-h-[602px]"
      right={
        <button
          type="button"
          onClick={() => setIsLive((v) => !v)}
          className={`grid h-8 w-8 min-h-8 min-w-8 place-items-center rounded text-[12px] font-bold transition ${
            isLive ? "bg-red-500 text-white" : "bg-[#2a2a2f] text-zinc-300 hover:bg-[#3a3a40]"
          }`}
          aria-label={isLive ? "To‘xtatish" : "Jonli efir"}
        >
          {isLive ? "■" : "▶"}
        </button>
      }
    >
      <div className="relative flex min-h-0 flex-1 flex-col bg-black">
        <div className="absolute right-8 top-6 text-[14px] font-bold text-white">
          {isLive ? "JONLI" : "OFLAYN"}
        </div>

        <div className="mt-auto border-t border-[#303039] bg-[#18181b] p-3">
          <p className="truncate text-[14px] font-bold text-white">
            GTA 5 RP — Rocford server | FIB va jinoyatchilik: reydlar va quvishlar
          </p>
        </div>
      </div>
    </Panel>
  );
}

function QuickAction({ icon, title }: { icon: string; title: string }) {
  return (
    <button
      type="button"
      className="flex h-[100px] flex-col justify-between rounded-[3px] bg-[var(--primary)] p-3 text-left font-bold text-[var(--primary-text)] transition hover:brightness-110"
    >
      <span className="text-3xl leading-none">{icon}</span>
      <span className="text-[14px] leading-tight">{title}</span>
    </button>
  );
}

function QuickActions() {
  return (
    <Panel title="Tezkor amallar" className="h-[258px]">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 p-2 sm:grid-cols-4">
        <QuickAction icon="✎" title="Ma’lumotlarni o‘zgartirish" />
        <QuickAction icon="☂" title="Reyd kanali" />
        <QuickAction icon="☆" title="Maqsadlar boshqaruvi" />
        <QuickAction icon="♙" title="Qo'shma efir" />
      </div>
    </Panel>
  );
}

export default function StudioLayoutPreviewPage() {
  return (
    <main className="h-[100dvh] overflow-hidden bg-[#0e0e10] text-white">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_min(100%,460px)]">
        <div className="flex min-h-0 flex-col lg:min-h-0">
          <StreamPreview />
          <QuickActions />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:h-full">
          <ChatPanel />
        </div>
      </div>
    </main>
  );
}
