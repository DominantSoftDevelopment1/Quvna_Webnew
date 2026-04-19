"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const DONATE_ITEMS = [
  { id: "pubg",     name: "PUBG Mobile UC",   image: "/images/donate_pubg.png",          color: "#1A2535", desc: "UC — PUBG Mobile uchun asosiy valyuta" },
  { id: "ml",       name: "Mobile Legends",    image: "/images/donate_mobile_legends.png", color: "#1C1C2E", desc: "Diamond — Mobile Legends uchun" },
  { id: "freefire", name: "Free Fire Almaz",   image: "/images/donate_free_fire.png",      color: "#2E1A1A", desc: "Almaz — Free Fire uchun" },
  { id: "steam",    name: "Steam Wallet",      image: "/images/donate_steam.png",          color: "#1A2E1A", desc: "Steam hisobini to'ldirish" },
];

export default function DonatePage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="game-page-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <div>
          <h1 className="game-page-title">Donat qilish</h1>
          <p className="game-page-desc">O'yiningiz uchun tez va qulay donat</p>
        </div>
      </div>

      {/* Grid */}
      <div className="donate-page-grid">
        {DONATE_ITEMS.map((item) => (
          <Link key={item.id} href={`/donate/${item.id}`} className="donate-page-card">
            <div className="donate-page-img-wrap">
              <img src={item.image} alt={item.name} className="donate-img" />
            </div>
            <div className="donate-page-info">
              <p className="donate-page-name">{item.name}</p>
              <p className="donate-page-desc-text">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
