"use client";

import { useState } from "react";
import { useGameClubs } from "@/hooks/useHome";
import { cdnUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export function HomeGameClubs() {
  const { data: clubs = [], isLoading } = useGameClubs();

  if (isLoading) {
    return (
      <div className="flex justify-start items-start gap-[20px] overflow-x-auto scrollbar-none">
        {[0, 1, 2].map((i) => (
          <div key={i} className="club-card">
            <Skeleton className="w-[200px] h-[164px] rounded-2xl" />
            <Skeleton className="mt-2 h-4 w-3/4" />
            <Skeleton className="mt-1.5 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!clubs.length) {
    return (
      <div>
        <div className="club-empty">
          <img src="/icons/game.svg" alt="" width={32} height={32} className="opacity-30" />
          <p>Hozirda game klublar yo'q</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start items-start gap-[20px] overflow-x-auto scrollbar-none pb-2">
      {clubs.map((club: ClubItem) => (
        <GameClubCard key={club.id} club={club} />
      ))}
    </div>
  );
}

function GameClubCard({ club }: { club: ClubItem }) {
  const [isFav, setIsFav] = useState(club.isFavorite ?? false);
  const attachments: string[] = club.attachments ?? (club.imageUrl ? [club.imageUrl] : club.image ? [club.image] : []);

  return (
    <div className="club-card">
      <div className="club-img-wrap">
        {attachments.length > 0 ? (
          <img src={cdnUrl(attachments[0])} alt={club.name} loading="lazy" className="club-img" />
        ) : null}
        <button
          type="button"
          aria-label={isFav ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
          onClick={() => setIsFav((v) => !v)}
          className="club-fav-btn"
        >
          <img
            src={isFav ? "/icons/favourite.svg" : "/icons/favourite_2.svg"}
            alt=""
            width={16}
            height={16}
            className={isFav ? "" : "icon-invert"}
          />
        </button>
      </div>

      <div className="club-info">
        <p className="club-name line-clamp-1">{club.name}</p>
        {club.address && (
          <div className="club-address">
            <img src="/icons/location.svg" alt="" width={12} height={12} className="icon-muted" />
            <span className="line-clamp-1">{club.address}</span>
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
}

interface ClubItem {
  id: number;
  name: string;
  imageUrl?: string;
  image?: string;
  attachments?: string[];
  address?: string;
  price?: number | string;
  isFavorite?: boolean;
}
