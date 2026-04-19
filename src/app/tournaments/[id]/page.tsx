"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cdnUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface Tournament {
  id: number; name?: string; title?: string;
  imageUrl?: string; image?: string;
  description?: string;
  teamCount?: number; maxParticipants?: number;
  prizePool?: number | string;
  startDate?: string; endDate?: string;
  matchStatus?: string; teamFormat?: string;
}

interface Prize { position: number; amount: number; }

function useTournamentById(id: string) {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const { data } = await api.get(`/competition/${id}`);
      return (data?.data ?? data) as Tournament;
    },
    enabled: !!id,
  });
}

function useTournamentPrizes(id: string) {
  return useQuery({
    queryKey: ["tournament-prizes", id],
    queryFn: async () => {
      const { data } = await api.get(`/competition/${id}/prizes`);
      return (data?.data ?? []) as Prize[];
    },
    enabled: !!id,
  });
}

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: t, isLoading } = useTournamentById(id);
  const { data: prizes = [] } = useTournamentPrizes(id);

  if (isLoading) return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-4">
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  );

  if (!t) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-muted">Turnir topilmadi</p>
      <button type="button" className="miniapp-play-btn" onClick={() => router.push("/tournaments")}>Orqaga</button>
    </div>
  );

  const img = t.imageUrl ?? t.image;
  const name = t.name ?? t.title ?? "Turnir";

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Back */}
      <div className="game-page-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <h1 className="game-page-title line-clamp-1">{name}</h1>
      </div>

      {/* Hero image */}
      <div className="tournament-detail-hero mx-4">
        {img ? (
          <img src={cdnUrl(img)} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-card2 flex items-center justify-center">
            <img src="/icons/star.svg" alt="" width={48} height={48} className="icon-primary" />
          </div>
        )}
        <div className="banner-gradient" />
        {t.matchStatus === "ACTIVE" && (
          <span className="tournament-status-badge active absolute top-3 left-3">Davom etmoqda</span>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {/* Stats row */}
        <div className="tournament-stats-row">
          <div className="tournament-stat">
            <span className="tournament-stat-val">{t.teamCount ?? t.maxParticipants ?? 0}</span>
            <span className="tournament-stat-label">Ishtirokchilar</span>
          </div>
          {t.prizePool && (
            <div className="tournament-stat">
              <span className="tournament-stat-val text-accent">{Number(t.prizePool).toLocaleString()}</span>
              <span className="tournament-stat-label">Mukofot (so'm)</span>
            </div>
          )}
          {t.teamFormat && (
            <div className="tournament-stat">
              <span className="tournament-stat-val">{t.teamFormat}</span>
              <span className="tournament-stat-label">Format</span>
            </div>
          )}
        </div>

        {/* Description */}
        {t.description && (
          <p className="text-sm text-secondary leading-relaxed">{t.description}</p>
        )}

        {/* Prizes */}
        {prizes.length > 0 && (
          <div>
            <p className="donate-section-label">Mukofotlar</p>
            <div className="flex flex-col gap-2">
              {prizes.map((p) => (
                <div key={p.position} className="flex items-center gap-3 p-3 rounded-xl bg-card">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${p.position === 1 ? "medal-gold" : p.position === 2 ? "medal-silver" : p.position === 3 ? "medal-bronze" : "medal-other"}`}>
                    {p.position}
                  </span>
                  <span className="flex-1 text-sm font-medium text-primary">{p.position}-o'rin</span>
                  <span className="text-sm font-bold text-accent">{Number(p.amount).toLocaleString()} so'm</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participate button */}
        <button type="button" className="donate-buy-btn">
          Ishtirok etish
        </button>
      </div>
    </div>
  );
}
