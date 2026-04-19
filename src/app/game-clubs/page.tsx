"use client";

import { useRouter } from "next/navigation";
import { useGameClubs } from "@/hooks/useHome";
import { cdnUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface ClubItem {
  id: number; name: string; imageUrl?: string; image?: string;
  attachments?: string[]; address?: string; price?: number | string;
}

export default function GameClubsPage() {
  const router = useRouter();
  const { data: clubs = [], isLoading } = useGameClubs();

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="game-page-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <div>
          <h1 className="game-page-title">Game Klublar</h1>
          <p className="game-page-desc">Yaqin atrofdagi game klublar</p>
        </div>
      </div>

      {/* List */}
      <div>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[0,1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : !clubs.length ? (
          <p className="text-muted text-sm">Game klublar topilmadi</p>
        ) : (
          <div className="flex flex-col gap-3">
            {clubs.map((club: ClubItem) => {
              const img = club.attachments?.[0] ?? club.imageUrl ?? club.image;
              return (
                <div key={club.id} className="club-list-card">
                  <div className="club-list-img">
                    {img && <img src={cdnUrl(img)} alt={club.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="club-info">
                    <p className="club-name">{club.name}</p>
                    {club.address && (
                      <div className="club-address">
                        <img src="/icons/location.svg" alt="" width={12} height={12} className="icon-muted" />
                        <span>{club.address}</span>
                      </div>
                    )}
                    {club.price != null && (
                      <div className="club-price">
                        <img src="/icons/money.svg" alt="" width={12} height={12} className="icon-primary" />
                        <span>{Number(club.price).toLocaleString()} so'm/soat</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
