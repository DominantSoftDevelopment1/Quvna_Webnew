"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useRating } from "@/hooks/useRating";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CATEGORY_AMBIENT_BG_CLASS,
  GAME_CATEGORY_BACKGROUND,
  RATING_TAB_TO_CATEGORY,
} from "@/lib/categoryGameBackgrounds";

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

  const categoryId = RATING_TAB_TO_CATEGORY[tab.type] ?? "pubg";
  const ambient = GAME_CATEGORY_BACKGROUND[categoryId];

  const getAmount = (entry: REntry): number | null => {
    const raw = (entry as Record<string, unknown>)[tab.field] ?? entry.amount;
    return raw != null ? Number(raw) : null;
  };

  const top3 = list.slice(0, 3);
  const rank4to10 = list.slice(3, 10);
  const rest = list.slice(10);

  const ratingBg = `url('${ambient.image}')`;

  return (
    <>
      <div
        aria-hidden
        className={CATEGORY_AMBIENT_BG_CLASS}
        style={{
          backgroundImage: ` ${ambient.overlay}, url('${ambient.image}')`,
          backgroundSize: "cover",
          backgroundPosition: ambient.position ?? "center",
        }}
      />

      <div className="relative z-[1] flex w-full min-w-0 justify-center box-border pb-8">
        <div className="rating-page w-full min-w-0 box-border">
          <div
            className="rating-hero"
            style={{ ["--rating-bg"]: ratingBg } as CSSProperties}
          >
            <div className="rating-hero-inner">
              <div className="rating-header">
                <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
                  <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
                </button>
                <img src="/icons/internet.svg" alt="" width={22} height={22} className="icon-primary" />
                <h1 className="rating-header-title">Global Reyting</h1>
              </div>

              <div className="rating-tabs">
                {TABS.map((t, i) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`rating-tab ios-tab${active === i ? " active" : ""}`}
                  >
                    <img src={t.icon} alt={t.label} width={20} height={20} className="rating-tab-icon" />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {isLoading ? (
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-56 rounded-2xl" />
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 rounded-xl" />
                  ))}
                </div>
              ) : !list.length ? (
                <p className="mt-6 text-sm text-muted">Reyting topilmadi</p>
              ) : (
                <>
                  <div className="rating-podium-wrap">
                    <div className="rating-podium-players">
                      <PodiumSlot entry={top3[1]} rank={2} amount={getAmount(top3[1])} currency={tab.currency} />
                      <PodiumSlot entry={top3[0]} rank={1} amount={getAmount(top3[0])} currency={tab.currency} first />
                      <PodiumSlot entry={top3[2]} rank={3} amount={getAmount(top3[2])} currency={tab.currency} />
                    </div>
                    <div className="rating-podium-glow" aria-hidden />
                  </div>

                  {(rank4to10.length > 0 || rest.length > 0) && (
                    <div className="rating-list-stack mt-12">
                      {rank4to10.map((entry: REntry, idx: number) => (
                        <RankRow
                          key={entry.id ?? `row-${idx + 4}`}
                          entry={entry}
                          rank={idx + 4}
                          amount={getAmount(entry)}
                          currency={tab.currency}
                        />
                      ))}
                      {rest.map((entry: REntry, idx: number) => (
                        <RankRow
                          key={entry.id ?? `row-${idx + 11}`}
                          entry={entry}
                          rank={idx + 11}
                          amount={getAmount(entry)}
                          currency={tab.currency}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Podium top 3 — gradient rank blocks (toj / wreath assetlari o‘zgarmaydi) ── */
function PodiumSlot({ entry, rank, amount, currency, first }: {
  entry: REntry | undefined; rank: number; amount: number | null; currency: string; first?: boolean;
}) {
  const wreath = WREATH[rank - 1];
  const blockTone = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze";
  const orderClass = rank === 1 ? "first" : rank === 2 ? "second" : "third";

  if (!entry) {
    return (
      <div className={`rating-podium-slot rank-${rank} ${orderClass}`}>
        <div className="rating-podium-stack">
          <div className="rating-podium-avatar-wrap rating-podium-avatar-wrap--empty">
            <img src={wreath} alt="" className="rating-wreath rating-wreath--muted" />
            <div className={`rating-podium-avatar-ring rank-${rank}`}>
              <div className="rating-podium-avatar-ph">—</div>
            </div>
          </div>
          <div className={`rating-rank-block ${blockTone}`}>
            <div className="rating-block-rank-num">{rank}</div>
            <div className="rating-block-divider" aria-hidden />
            <p className="rating-block-name">—</p>
            <p className="rating-block-amount">
              — <span className="text-xs text-muted">{currency}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const name = entry.user?.fullName ?? entry.user?.username ?? entry.username ?? "—";

  return (
    <div className={`rating-podium-slot rank-${rank} ${orderClass}`}>
      <div className="rating-podium-stack">
        <div className="rating-podium-avatar-wrap">
          {first && (
            <img src="/icons/crown_gold.svg" alt="" className="rating-crown" width={40} height={40} />
          )}
          <img src={wreath} alt="" className="rating-wreath" />
          <div className={`rating-podium-avatar-ring rank-${rank}`}>
            {entry.user?.avatar ? (
              <img src={cdnUrl(entry.user.avatar)} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="rating-podium-avatar-ph">{name[0]?.toUpperCase()}</div>
            )}
          </div>
        </div>
        <div className={`rating-rank-block ${blockTone}`}>
          <div className="rating-block-rank-num">{rank}</div>
          <div className="rating-block-divider" aria-hidden />
          <p className="rating-block-name line-clamp-1">{name}</p>
          {amount != null && (
            <p className="rating-block-amount">
              {formatCount(amount)} <span className="text-xs text-muted">{currency}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Rank row (4th+) ── */
function RankRow({ entry, rank, amount, currency }: {
  entry: REntry; rank: number; amount: number | null; currency: string;
}) {
  const name = entry.user?.fullName ?? entry.user?.username ?? entry.username ?? "Foydalanuvchi";
  const badgeImg = rank <= 10 ? `/images/rating_number_${rank}.png` : null;
  const topTen = rank <= 10;

  return (
    <div className="rating-rank-row glass-card ios-hover">
      <div className={`rating-rank-num${topTen ? " rating-rank-num--top" : " rating-rank-num--rest"}`}>
        {badgeImg ? (
          <img src={badgeImg} alt={`${rank}`} width={28} height={28} />
        ) : (
          rank
        )}
      </div>
      {entry.user?.avatar ? (
        <img src={cdnUrl(entry.user.avatar)} alt="" className="rating-rank-avatar" />
      ) : (
        <div className="rating-rank-avatar bg-card2 flex items-center justify-center font-bold text-sm text-muted">
          {name[0]?.toUpperCase()}
        </div>
      )}
      <div className="rating-rank-name line-clamp-1">{name}</div>
      {amount != null && (
        <div className="rating-rank-amount">
          {formatCount(amount)} {currency}
        </div>
      )}
    </div>
  );
}
