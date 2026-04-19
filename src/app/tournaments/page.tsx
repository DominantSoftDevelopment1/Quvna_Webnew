"use client";

import { useRouter } from "next/navigation";
import { useTournaments } from "@/hooks/useHome";
import { cdnUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

interface Tournament {
  id: number; name?: string; title?: string;
  imageUrl?: string; image?: string;
  teamCount?: number; maxParticipants?: number;
  prizePool?: number | string;
  startDate?: string; endDate?: string;
  matchStatus?: string;
}

export default function TournamentsPage() {
  const router = useRouter();
  const { data: items = [], isLoading } = useTournaments();

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="game-page-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <div>
          <h1 className="game-page-title">Turnirlar</h1>
          <p className="game-page-desc">Hozirda davom etayotgan turnirlar</p>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0,1,2,3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : !items.length ? (
          <p className="text-muted text-sm">Turnirlar topilmadi</p>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((t: Tournament) => (
              <Link key={t.id} href={`/tournaments/${t.id}`} className="tournament-list-card">
                <div className="tournament-list-img">
                  {(t.imageUrl || t.image) ? (
                    <img src={cdnUrl(t.imageUrl ?? t.image)} alt={t.name ?? t.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-card2 flex items-center justify-center">
                      <img src="/icons/star.svg" alt="" width={28} height={28} className="icon-primary" />
                    </div>
                  )}
                </div>
                <div className="tournament-list-info">
                  <p className="tournament-list-name line-clamp-1">{t.name ?? t.title}</p>
                  <div className="tournament-list-meta">
                    <span>{t.teamCount ?? t.maxParticipants ?? 0} jamoa</span>
                    {t.prizePool && <span className="text-accent font-semibold">{Number(t.prizePool).toLocaleString()} so'm</span>}
                  </div>
                  {t.matchStatus && (
                    <span className={`tournament-status-badge${t.matchStatus === "ACTIVE" ? " active" : ""}`}>
                      {t.matchStatus === "ACTIVE" ? "Davom etmoqda" : t.matchStatus}
                    </span>
                  )}
                </div>
                <img src="/icons/back_left.svg" alt="" width={16} height={16} className="tournament-arrow-icon ml-auto" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
