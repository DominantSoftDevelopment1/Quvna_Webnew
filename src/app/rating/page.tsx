"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRating } from "@/hooks/useRating";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

const TABS = [
  { label: "PUBG Mobile",    type: "PUBG_UC",    currency: "UC",  icon: "/images/uc.png",                   field: "ucAmount"    },
  { label: "Mobile Legends", type: "ML",          currency: "💎",  icon: "/images/mobile_legends_almas.png", field: "mlamount"    },
  { label: "Free Fire",      type: "FREE_FIRE",   currency: "💎",  icon: "/images/freefire_almas.png",       field: "ffAmount"    },
  { label: "Steam",          type: "STEAM",       currency: "UZS", icon: "/images/donate_steam.png",         field: "steamAmount" },
];

const WREATH = ["/images/wreath_gold.png", "/images/wreath_silver.png", "/images/wreath_bronze.png"];

interface REntry {
  id?: number; amount?: number;
  ucAmount?: number; mlamount?: number; ffAmount?: number; steamAmount?: number;
  username?: string;
  user?: { username?: string; fullName?: string; avatar?: string };
}

export default function RatingPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const { data: list = [], isLoading } = useRating(tab.type);

  const getAmount = (entry: REntry): number | null => {
    const raw = (entry as Record<string, unknown>)[tab.field] ?? entry.amount;
    return raw != null ? Number(raw) : null;
  };

  const top3 = list.slice(0, 3);
  const rank4to10 = list.slice(3, 10);
  const rest = list.slice(10);

  return (
    <div className="max-w-6xl mx-auto pb-8">

      {/* ── Sticky header ── */}
      <div className="rating-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <img src="/icons/internet.svg" alt="" width={22} height={22} className="icon-primary" />
        <h1 className="rating-header-title">Global Reyting</h1>
      </div>

      {/* ── Tabs ── */}
      <div className="rating-tabs">
        {TABS.map((t, i) => (
          <button key={t.type} type="button"
            onClick={() => setActive(i)}
            className={`rating-tab${active === i ? " active" : ""}`}>
            <img src={t.icon} alt={t.label} width={20} height={20} className="rating-tab-icon" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-56 rounded-2xl" />
          {[0,1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : !list.length ? (
        <p className="mt-6 text-sm text-muted">Reyting topilmadi</p>
      ) : (
        <>
          {/* ── Podium top 3 ── */}
          <div className="rating-podium-wrap">
            <img src="/images/prize_podium.png" alt="" className="rating-podium-bg" />
            <div className="rating-podium-players">
              {/* 2nd */}
              <PodiumSlot entry={top3[1]} rank={2} amount={getAmount(top3[1])} currency={tab.currency} />
              {/* 1st */}
              <PodiumSlot entry={top3[0]} rank={1} amount={getAmount(top3[0])} currency={tab.currency} first />
              {/* 3rd */}
              <PodiumSlot entry={top3[2]} rank={3} amount={getAmount(top3[2])} currency={tab.currency} />
            </div>
          </div>

          {/* ── Rank 4–10 (badge images) ── */}
          {rank4to10.length > 0 && (
            <div className="mt-2 space-y-2">
              {rank4to10.map((entry: REntry, idx: number) => (
                <RankRow key={entry.id ?? idx} entry={entry} rank={idx + 4} amount={getAmount(entry)} currency={tab.currency} highlight />
              ))}
            </div>
          )}

          {/* ── Rank 11+ ── */}
          {rest.length > 0 && (
            <div className="mt-2 space-y-2">
              {rest.map((entry: REntry, idx: number) => (
                <RankRow key={entry.id ?? idx} entry={entry} rank={idx + 11} amount={getAmount(entry)} currency={tab.currency} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Podium slot (1st/2nd/3rd) ── */
function PodiumSlot({ entry, rank, amount, currency, first }: {
  entry: REntry | undefined; rank: number; amount: number | null; currency: string; first?: boolean;
}) {
  if (!entry) return <div className="rating-podium-slot" />;
  const name = entry.user?.fullName ?? entry.user?.username ?? entry.username ?? "—";
  const wreath = WREATH[rank - 1];

  return (
    <div className={`rating-podium-slot${first ? " first" : ""}`}>
      {/* Crown for 1st */}
      {first && <img src="/icons/crown.svg" alt="" className="rating-crown icon-primary" />}
      {/* Avatar with wreath */}
      <div className="rating-podium-avatar-wrap">
        <div className={`rating-podium-avatar-ring rank-${rank}`}>
          {entry.user?.avatar ? (
            <img src={cdnUrl(entry.user.avatar)} alt={name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-card2 flex items-center justify-center font-bold text-primary">
              {name[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <img src={wreath} alt="" className="rating-wreath" />
      </div>
      {/* Badge number */}
      <img src={`/images/rating_number_${rank}.png`} alt={`${rank}`} className="rating-badge-num" />
      <p className="rating-podium-name line-clamp-1">{name}</p>
      {amount != null && (
        <p className="rating-podium-amount">{formatCount(amount)} <span className="text-xs text-muted">{currency}</span></p>
      )}
    </div>
  );
}

/* ── Rank row (4th+) ── */
function RankRow({ entry, rank, amount, currency, highlight }: {
  entry: REntry; rank: number; amount: number | null; currency: string; highlight?: boolean;
}) {
  const name = entry.user?.fullName ?? entry.user?.username ?? entry.username ?? "Foydalanuvchi";
  const badgeImg = rank <= 10 ? `/images/rating_number_${rank}.png` : null;

  return (
    <div className={`rating-rank-row${highlight ? " highlight" : ""}`}>
      {badgeImg ? (
        <img src={badgeImg} alt={`${rank}`} width={28} height={28} className="shrink-0" />
      ) : (
        <span className="rating-rank-num">{rank}</span>
      )}
      {entry.user?.avatar ? (
        <img src={cdnUrl(entry.user.avatar)} alt="" className="rating-rank-avatar" />
      ) : (
        <div className="rating-rank-avatar bg-card2 flex items-center justify-center font-bold text-sm text-muted">
          {name[0]?.toUpperCase()}
        </div>
      )}
      <p className="flex-1 text-sm font-medium text-primary line-clamp-1">{name}</p>
      {amount != null && (
        <span className="text-sm font-bold text-accent">{formatCount(amount)} {currency}</span>
      )}
    </div>
  );
}
