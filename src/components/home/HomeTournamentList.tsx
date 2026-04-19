"use client";

import Link from "next/link";

export function HomeTournamentList() {
  return (
    <Link href="/tournaments" className="tournament-banner-home">
      <div className="tournament-banner-inner">
        <div className="tournament-banner-icon-wrap">
          <img src="/icons/crown.svg" alt="" width={24} height={24} className="tournament-banner-icon" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="tournament-banner-title">Turnirlar ro'yxati</p>
          <p className="tournament-banner-subtitle">Hozirda davom etayotgan turnirlar</p>
        </div>
        <div className="tournament-banner-arrow">
          <img src="/icons/back_left.svg" alt="" width={16} height={16}
            className="tournament-banner-arrow-icon" />
        </div>
      </div>
    </Link>
  );
}
