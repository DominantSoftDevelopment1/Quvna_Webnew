"use client";

import { useTournaments } from "@/hooks/useHome";
import { cdnUrl } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trophy, Users } from "lucide-react";

export function HomeTournaments() {
  const { data: items = [], isLoading } = useTournaments();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-56 h-32 shrink-0" />
        ))}
      </div>
    );
  }

  if (!items.length) return (
    <div className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
      Turnirlar topilmadi
    </div>
  );

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {items.map((t: Tournament) => (
        <div
          key={t.id}
          className="shrink-0 w-56 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="relative h-28">
            {t.imageUrl || t.image ? (
              <img
                src={cdnUrl(t.imageUrl ?? t.image)}
                alt={t.name ?? t.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "var(--bg-card2)" }}
              >
                <Trophy size={32} style={{ color: "var(--primary)" }} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3">
              <p className="text-white text-xs font-semibold line-clamp-1">
                {t.name ?? t.title}
              </p>
              {t.teamCount != null && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Users size={10} className="text-white/60" />
                  <span className="text-white/60 text-xs">{t.teamCount} jamoa</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface Tournament {
  id: number;
  name?: string;
  title?: string;
  imageUrl?: string;
  image?: string;
  teamCount?: number;
}
