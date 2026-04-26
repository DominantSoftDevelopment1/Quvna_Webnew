"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Kategoriyalar ─── */
const CATS = [
  { id: "all",     label: "Barchasi"  },
  { id: "games",   label: "O'yinlar"  },
  { id: "apps",    label: "Ilovalar"  },
  { id: "arcade",  label: "Arkada"    },
  { id: "puzzle",  label: "Boshqotirma" },
];

/* ─── Mini Apps/Games (admin paneldan qo'shiladi, hozir demo) ─── */
const MINI_APPS: MiniApp[] = [
  {
    id: 1,
    name: "2048",
    description: "Raqamlarni birlashtir, 2048 ga yet!",
    icon: "🎮",
    color: "#1D3A34",
    cat: "puzzle",
    isNew: false,
    isHot: true,
    plays: "124K",
    href: "/miniapp/play/2048",
  },
  {
    id: 2,
    name: "Snake",
    description: "Klassik ilon o'yini",
    img: "/images/games/snake.png",
    color: "#1A2E1A",
    cat: "arcade",
    isNew: false,
    isHot: false,
    plays: "89K",
    href: "/miniapp/play/snake",
  },
  {
    id: 3,
    name: "Tic Tac Toe",
    description: "Do'sting bilan X-O o'yna",
    img: "/images/games/tic-tac-toe.png",
    color: "#1C1C2E",
    cat: "games",
    isNew: true,
    isHot: false,
    plays: "45K",
    href: "/miniapp/play/tictactoe",
  },
  {
    id: 4,
    name: "Memory Cards",
    description: "Juft kartalarni top",
    img: "/images/games/memory-cards.png",
    color: "#2E1A1A",
    cat: "puzzle",
    isNew: true,
    isHot: false,
    plays: "32K",
    href: "/miniapp/play/memory",
  },
  {
    id: 5,
    name: "Flappy Bird",
    description: "Qushni uchir, to'siqlardan o't",
    img: "/images/games/flappy-bird.png",
    color: "#1A2535",
    cat: "arcade",
    isNew: false,
    isHot: true,
    plays: "210K",
    href: "/miniapp/play/flappy",
  },
  {
    id: 6,
    name: "Quiz Master",
    description: "Bilimingizni sinab ko'ring",
    img: "/images/games/quiz-master.png",
    color: "#2A1A35",
    cat: "apps",
    isNew: true,
    isHot: false,
    plays: "18K",
    href: "/miniapp/play/quiz",
  },
];

interface MiniApp {
  id: number; name: string; description: string;
  icon?: string; img?: string; color: string; cat: string;
  isNew: boolean; isHot: boolean; plays: string; href: string;
}

export default function MiniAppPage() {
  const [activeCat, setActiveCat] = useState("all");

  const filtered = activeCat === "all"
    ? MINI_APPS
    : MINI_APPS.filter((a) => a.cat === activeCat);

  const hot = MINI_APPS.filter((a) => a.isHot);
  const newApps = MINI_APPS.filter((a) => a.isNew);

  return (
    <div className="max-w-6xl mx-auto pb-8">

      {/* ── Kategoriyalar ── */}
      <div className="miniapp-cat-bar">
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCat(c.id)}
            className={`miniapp-cat-tab${activeCat === c.id ? " active" : ""}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {activeCat !== "all" ? (
        /* ── Filtered grid ── */
        <div className="pt-4">
          <div className="miniapp-list">
            {filtered.map((app) => <MiniAppCard key={app.id} app={app} big />)}
          </div>
        </div>
      ) : (
        <>
          {/* ── Mashhur ── */}
          <div className="section-title-wrap">
            <h2 className="section-title-text">Mashhur o'yinlar</h2>
          </div>
          <div className="miniapp-list">
            {hot.map((app) => <MiniAppCard key={app.id} app={app} big />)}
          </div>

          {/* ── Yangilar ── */}
          <div className="section-title-wrap">
            <h2 className="section-title-text">Yangilar</h2>
          </div>
          <div className="miniapp-list">
            {newApps.map((app) => <MiniAppCard key={app.id} app={app} big />)}
          </div>

          {/* ── Barcha ilovalar ── */}
          <div className="section-title-wrap">
            <h2 className="section-title-text">Barcha ilovalar</h2>
          </div>
          <div className="miniapp-grid">
            {MINI_APPS.map((app) => <MiniAppGridCard key={app.id} app={app} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Katta list karta (mashhur/yangilar uchun) ─── */
function MiniAppCard({ app, big }: { app: MiniApp; big?: boolean }) {
  return (
    <Link href={app.href} className="miniapp-list-card">
      <div className="miniapp-list-icon" style={{ "--app-color": app.color } as React.CSSProperties}>
        {app.img
          ? <img src={app.img} alt={app.name} className="miniapp-list-img" />
          : <span className="miniapp-list-emoji">{app.icon}</span>}
      </div>
      <div className="miniapp-list-info">
        <div className="miniapp-list-name-row">
          <span className="miniapp-list-name">{app.name}</span>
          <div className="flex gap-1">
            {app.isHot && <span className="miniapp-badge hot">🔥 Trend</span>}
            {app.isNew && <span className="miniapp-badge new">Yangi</span>}
          </div>
        </div>
        <p className="miniapp-list-desc line-clamp-1">{app.description}</p>
        <p className="miniapp-list-plays">{app.plays} o'yin</p>
      </div>
      <button type="button" className="miniapp-play-btn">O'yna</button>
    </Link>
  );
}

/* ─── Kichik grid karta ─── */
function MiniAppGridCard({ app }: { app: MiniApp }) {
  return (
    <Link href={app.href} className="miniapp-app-card">
      <div className="miniapp-app-icon-wrap" style={{ "--app-color": app.color } as React.CSSProperties}>
        {app.img
          ? <img src={app.img} alt={app.name} className="miniapp-list-img" />
          : <span className="miniapp-grid-emoji">{app.icon}</span>}
      </div>
      <p className="miniapp-app-name line-clamp-1">{app.name}</p>
      <p className="miniapp-app-tag">{app.plays} o'yin</p>
    </Link>
  );
}
