"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useRating } from "@/hooks/useRating";
import { User as UserIcon } from "lucide-react";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  CATEGORY_AMBIENT_BG_CLASS,
  GAME_CATEGORY_BACKGROUND,
  RATING_TAB_TO_CATEGORY,
} from "@/lib/categoryGameBackgrounds";
import { resolveUserAvatarHref } from "@/lib/streamChat";

const TABS = [
  { label: "PUBG Mobile",    type: "PUBG_UC",    currency: "UC",  icon: "/images/uc.png",                   field: "ucAmount"    },
  { label: "Mobile Legends", type: "ML",          currency: "💎",  icon: "/images/mobile_legends_almas.png", field: "mlamount"    },
  { label: "Free Fire",      type: "FREE_FIRE",   currency: "💎",  icon: "/images/freefire_almas.png",       field: "ffAmount"    },
  { label: "Steam",          type: "STEAM",       currency: "UZS", icon: "/images/donate_steam.png",         field: "steamAmount" },
];

const WREATH = ["/images/wreath_gold.png", "/images/wreath_silver.png", "/images/wreath_bronze.png"];

interface REntry {
  id?: number;
  amount?: number;
  ucAmount?: number;
  mlamount?: number;
  ffAmount?: number;
  steamAmount?: number;
  username?: string;
  user?: { username?: string; fullName?: string; avatar?: string };
  userResponseDTO?: Record<string, unknown>;
}

function readRatingStr(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s || undefined;
}

function ratingUserRecord(entry: REntry): Record<string, unknown> {
  const e = entry as unknown as Record<string, unknown>;
  const raw = e.user ?? e.userResponseDTO ?? e.userDto ?? e.senderUserResponseDTO;
  return raw !== null && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

function ratingRowName(entry: REntry): string {
  const u = ratingUserRecord(entry);
  const full =
    readRatingStr(u.fullName) ||
    readRatingStr(u.full_name) ||
    undefined;

  const first = readRatingStr(u.firstName) || readRatingStr(u.first_name) || "";
  const last = readRatingStr(u.lastName) || readRatingStr(u.last_name) || "";
  const fromParts = `${first} ${last}`.trim();

  const name =
    full ||
    (fromParts ? fromParts : undefined) ||
    readRatingStr(u.username) ||
    readRatingStr(u.userName) ||
    readRatingStr(u.nickname) ||
    readRatingStr(u.displayName) ||
    readRatingStr(u.display_name) ||
    readRatingStr(entry.username) ||
    undefined;

  if (name) return name;

  // Oxirgi fallback: id bo'lsa user_123 ko'rinishida chiqsin
  const e = entry as unknown as Record<string, unknown>;
  const rawId = u.id ?? u.userId ?? u.user_id ?? e.userId ?? e.user_id ?? e.id;
  if (typeof rawId === "number" && Number.isFinite(rawId) && rawId > 0) return `user_${rawId}`;
  if (typeof rawId === "string" && /^\d+$/.test(rawId)) return `user_${rawId}`;

  return "User";
}

function ratingAvatarSrc(entry: REntry): string | null {
  const href = resolveUserAvatarHref(ratingUserRecord(entry));
  if (!href) return null;
  return href.startsWith("http") ? href : cdnUrl(href);
}

/** Tab bo‘yicha o‘yin nick / UID (backend `userResponseDTO` yoki tekis maydonlar). */
function ratingTabMeta(
  tabField: string,
  entry: REntry
): { nick?: string; uid?: string; uidLabel?: string } {
  const e = entry as unknown as Record<string, unknown>;
  const u = ratingUserRecord(entry);
  if (tabField === "ucAmount") {
    const play =
      readRatingStr(u.playName) ||
      readRatingStr(u.play_name) ||
      readRatingStr(e.playName) ||
      readRatingStr(e.play_name);
    const gid =
      readRatingStr(u.gameID) ||
      readRatingStr(u.game_id) ||
      readRatingStr(e.gameID) ||
      readRatingStr(e.game_id);
    return { ...(play ? { nick: play } : {}), ...(gid ? { uid: gid, uidLabel: "UID" } : {}) };
  }
  if (tabField === "mlamount") {
    const n =
      readRatingStr(u.mobileLegendsName) ||
      readRatingStr(u.mobile_legends_name) ||
      readRatingStr(e.mobileLegendsName) ||
      readRatingStr(e.mobile_legends_name);
    const id =
      readRatingStr(u.mobileLegendsUID) ||
      readRatingStr(u.mobile_legends_u_i_d) ||
      readRatingStr(e.mobileLegendsUID) ||
      readRatingStr(e.mobile_legends_u_i_d);
    return { ...(n ? { nick: n } : {}), ...(id ? { uid: id, uidLabel: "UID" } : {}) };
  }
  if (tabField === "ffAmount") {
    const n =
      readRatingStr(u.freeFireName) ||
      readRatingStr(u.free_fire_name) ||
      readRatingStr(e.freeFireName) ||
      readRatingStr(e.free_fire_name);
    const id =
      readRatingStr(u.freeFireUID) ||
      readRatingStr(u.free_fire_u_i_d) ||
      readRatingStr(e.freeFireUID) ||
      readRatingStr(e.free_fire_u_i_d);
    return { ...(n ? { nick: n } : {}), ...(id ? { uid: id, uidLabel: "UID" } : {}) };
  }
  if (tabField === "steamAmount") {
    const id =
      readRatingStr(u.steamId) || readRatingStr(u.steamUID) || readRatingStr(e.steamId) || readRatingStr(e.steamUID);
    const n =
      readRatingStr(u.steamName) ||
      readRatingStr(u.steam_name) ||
      readRatingStr(e.steamName) ||
      readRatingStr(e.steam_name);
    return { ...(n ? { nick: n } : {}), ...(id ? { uid: id, uidLabel: "Steam" } : {}) };
  }
  return {};
}

export default function RatingPage() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const { data: list = [], isLoading } = useRating<REntry>(tab.type);

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
                <div className="rating-header-center">
                  <img src="/icons/internet.svg" alt="" width={22} height={22} className="icon-primary" />
                  <h1 className="rating-header-title-static">Global Reyting</h1>
                </div>
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
                      <PodiumSlot
                        entry={top3[1]}
                        rank={2}
                        amount={getAmount(top3[1])}
                        currency={tab.currency}
                        tabField={tab.field}
                      />
                      <PodiumSlot
                        entry={top3[0]}
                        rank={1}
                        amount={getAmount(top3[0])}
                        currency={tab.currency}
                        tabField={tab.field}
                        first
                      />
                      <PodiumSlot
                        entry={top3[2]}
                        rank={3}
                        amount={getAmount(top3[2])}
                        currency={tab.currency}
                        tabField={tab.field}
                      />
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
                          tabField={tab.field}
                        />
                      ))}
                      {rest.map((entry: REntry, idx: number) => (
                        <RankRow
                          key={entry.id ?? `row-${idx + 11}`}
                          entry={entry}
                          rank={idx + 11}
                          amount={getAmount(entry)}
                          currency={tab.currency}
                          tabField={tab.field}
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
function PodiumSlot({ entry, rank, amount, currency, tabField, first }: {
  entry: REntry | undefined;
  rank: number;
  amount: number | null;
  currency: string;
  tabField: string;
  first?: boolean;
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

  const name = ratingRowName(entry);
  const avSrc = ratingAvatarSrc(entry);
  const meta = ratingTabMeta(tabField, entry);
  const hasName = !!name.trim();

  return (
    <div className={`rating-podium-slot rank-${rank} ${orderClass}`}>
      <div className="rating-podium-stack">
        <div className="rating-podium-avatar-wrap">
          {first && (
            <img src="/icons/crown_gold.svg" alt="" className="rating-crown" width={40} height={40} />
          )}
          <img src={wreath} alt="" className="rating-wreath" />
          <div className={`rating-podium-avatar-ring rank-${rank}`}>
            {avSrc ? (
              <img src={avSrc} alt={name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="rating-podium-avatar-ph">
                {hasName ? (
                  name[0]?.toUpperCase()
                ) : (
                  <UserIcon size={18} className="text-white/65" aria-hidden />
                )}
              </div>
            )}
          </div>
        </div>
        <div className={`rating-rank-block ${blockTone}`}>
          <div className="rating-block-rank-num">{rank}</div>
          <div className="rating-block-divider" aria-hidden />
          <p className="rating-block-name line-clamp-1">{name}</p>
          {meta.nick || meta.uid ? (
            <div className="mt-0.5 px-0.5 space-y-0.5">
              {meta.nick ? (
                <p className="text-[10px] leading-tight text-white/50 line-clamp-1">
                  <span className="text-white/35">NIK</span> {meta.nick}
                </p>
              ) : null}
              {meta.uid ? (
                <p className="text-[10px] leading-tight text-white/50 line-clamp-1">
                  <span className="text-white/35">{meta.uidLabel ?? "UID"}</span> {meta.uid}
                </p>
              ) : null}
            </div>
          ) : null}
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
function RankRow({ entry, rank, amount, currency, tabField }: {
  entry: REntry;
  rank: number;
  amount: number | null;
  currency: string;
  tabField: string;
}) {
  const nameRaw = ratingRowName(entry);
  const hasName = !!nameRaw.trim();
  const name = nameRaw;
  const avSrc = ratingAvatarSrc(entry);
  const meta = ratingTabMeta(tabField, entry);
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
      {avSrc ? (
        <img src={avSrc} alt="" className="rating-rank-avatar" />
      ) : (
        <div className="rating-rank-avatar bg-card2 flex items-center justify-center font-bold text-sm text-muted">
          {hasName ? (
            name[0]?.toUpperCase()
          ) : (
            <UserIcon size={18} className="text-white/55" aria-hidden />
          )}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="rating-rank-name line-clamp-1">{name}</div>
        {meta.nick || meta.uid ? (
          <div className="mt-0.5 space-y-0.5">
            {meta.nick ? (
              <div className="text-[11px] text-white/45 line-clamp-1">
                <span className="text-white/35">NIK</span> {meta.nick}
              </div>
            ) : null}
            {meta.uid ? (
              <div className="text-[11px] text-white/45 line-clamp-1">
                <span className="text-white/35">{meta.uidLabel ?? "UID"}</span> {meta.uid}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {amount != null && (
        <div className="rating-rank-amount">
          {formatCount(amount)} {currency}
        </div>
      )}
    </div>
  );
}
