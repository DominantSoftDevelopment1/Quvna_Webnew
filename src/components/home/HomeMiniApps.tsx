"use client";

import Link from "next/link";

const FEATURED: MiniAppItem[] = [
  { id:1, name:"2048",         icon:"🎮",                            color:"#1D3A34", plays:"124K", href:"/miniapp/play/2048",      status: "ready" },
  { id:2, name:"Snake",        img:"/images/games/snake.png",        color:"#1A2E1A", plays:"89K",  href:"/miniapp/play/snake",     status: "ready" },
  { id:3, name:"Flappy Bird",  img:"/images/games/flappy-bird.png",  color:"#1A2535", plays:"210K", href:"/miniapp/play/flappy",    status: "soon" },
  { id:4, name:"Memory Cards", img:"/images/games/memory-cards.png", color:"#2E1A1A", plays:"32K",  href:"/miniapp/play/memory",    status: "ready" },
  { id:5, name:"Tic Tac Toe",  img:"/images/games/tic-tac-toe.png",  color:"#1C1C2E", plays:"45K",  href:"/miniapp/play/tictactoe", status: "ready" },
  { id:6, name:"Quiz Master",  img:"/images/games/quiz-master.png",  color:"#2A1A35", plays:"18K",  href:"/miniapp/play/quiz",      status: "ready" },
];

interface MiniAppItem {
  id: number; name: string; color: string; plays: string; href: string;
  icon?: string; img?: string; status: "ready" | "soon";
}

export function HomeMiniApps() {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-none">
      {FEATURED.map((app) => (
        <MiniAppCard key={app.id} app={app} />
      ))}
    </div>
  );
}

function MiniAppCard({ app }: { app: MiniAppItem }) {
  const isSoon = app.status === "soon";

  return (
    <Link
      href={isSoon ? "#" : app.href}
      className={`home-miniapp-card${isSoon ? " soon" : ""}`}
      onClick={isSoon ? (e) => e.preventDefault() : undefined}
    >
      <div
        className="home-miniapp-icon"
        style={{ "--app-color": app.color } as React.CSSProperties}
      >
        {app.img ? (
          <img src={app.img} alt={app.name} className="home-miniapp-img" />
        ) : (
          <span className="home-miniapp-emoji">{app.icon}</span>
        )}
        {isSoon && (
          <div className="home-miniapp-soon-overlay">
            <span>Tez kunda</span>
          </div>
        )}
      </div>
      <p className="home-miniapp-name">{app.name}</p>
      <p className="home-miniapp-plays">{isSoon ? "Yaqinda" : app.plays}</p>
    </Link>
  );
}
