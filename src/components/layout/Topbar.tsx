"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { cdnUrl } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";
import { resolvePubgRatingFromProfile } from "@/lib/profileRating";
import { useRating } from "@/hooks/useRating";

function readPositiveId(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string" && /^\d+$/.test(v)) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function extractRatingUserId(entry: unknown): number | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  const u =
    (e.user && typeof e.user === "object" ? (e.user as Record<string, unknown>) : null) ??
    (e.userResponseDTO && typeof e.userResponseDTO === "object"
      ? (e.userResponseDTO as Record<string, unknown>)
      : null) ??
    (e.userDto && typeof e.userDto === "object" ? (e.userDto as Record<string, unknown>) : null) ??
    null;
  return readPositiveId(e.userId ?? e.user_id ?? u?.id ?? u?.userId ?? u?.user_id);
}

export function Topbar() {
  const { user, isLoggedIn } = useAuthStore();
  const isAuthed = isLoggedIn();
  const userId = user?.id != null ? Number(user.id) : null;
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: ratingList = [], isLoading: ratingLoading } = useRating(isAuthed ? "PUBG_UC" : "");
  const { data: unreadCount = 0 } = useUnreadCount(isAuthed);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const p = (profile ?? {}) as {
    fullName?: string;
    firstName?: string;
    username?: string;
    avatar?: string;
    attachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
  };
  // Taxallus (username) eng yuqori priority — isim-familya faqat taxallus bo'lmasa
  const displayName = p.username || user?.username || p.fullName || p.firstName || user?.fullName || user?.firstName || "User";
  const avatarSrc =
    p.avatar || p.attachmentResponseDTO?.preSignedUrl || p.attachmentResponseDTO?.contentURL ||
    user?.avatar || user?.attachmentResponseDTO?.preSignedUrl || user?.attachmentResponseDTO?.contentURL;
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "U";

  const ratingScore =
    userId != null && userId > 0
      ? resolvePubgRatingFromProfile(profile as Record<string, unknown> | null | undefined)
      : 0;

  const ratingRank = (() => {
    if (!mounted || !isAuthed || userId == null || userId <= 0) return null;
    if (ratingLoading) return "…";
    const list = Array.isArray(ratingList) ? ratingList : [];
    const idx = list.findIndex((entry) => extractRatingUserId(entry) === userId);
    if (idx >= 0) return String(idx + 1);
    return list.length >= 50 ? "50+" : "—";
  })();

  const hideTopbar = pathname?.startsWith("/profile/edit");
  const isEfirlar = pathname?.startsWith("/videos/efirlar");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (hideTopbar) return null;

  return (
    <header className="topbar">
      <div className="my-[10px] flex min-w-0 flex-1 items-center">
        <Link
          href="/videos/efirlar"
          className={`topbar-efirlar${isEfirlar ? " active" : ""}`}
          aria-label="Efirlar"
        >
          <img src="/icons/stream.svg" alt="" width={20} height={20} className="topbar-efirlar-icon" />
          <span className="topbar-efirlar-text">Efirlar</span>
        </Link>
      </div>

      <div className="my-[10px] flex items-center justify-center gap-2">
        {/* Rating: kirgan foydalanuvchiga doim pill (profil bilan bir xil UC / fallback), mehmonda star */}
        {mounted && isAuthed && userId != null ? (
          <Link
            href="/rating"
            className="topbar-rating-widget"
            aria-label={
              ratingRank === "…" || ratingRank === null
                ? "Reyting yuklanmoqda"
                : `Reyting o‘rni: ${ratingRank}`
            }
          >
            <span className="topbar-rating-pill-text">
              <span className="topbar-rating-pill-brand">REYTING</span>
              <span className="topbar-rating-pill-rank">
                {ratingRank ?? (profileLoading ? "…" : ratingScore)}
              </span>
              <span className="topbar-rating-pill-star">★</span>
            </span>
          </Link>
        ) : (
          <Link href="/rating" className="topbar-rating-btn" aria-label="Reyting">
            <img src="/icons/star.svg" alt="" width={22} height={22} className="topbar-rating-star" />
          </Link>
        )}

        {/* Notifications always visible */}
        <Link href="/notifications" className="topbar-notif-btn" aria-label="Bildirishnomalar">
          <img src="/icons/notification.svg" alt="" width={20} height={20} className="icon-muted" />
          {unreadCount > 0 && <span className="topbar-notif-dot" />}
        </Link>

        {mounted && isAuthed ? (
          <>
            <Link href="/profile" className="topbar-avatar">
              {avatarSrc ? (
                <img
                  src={avatarSrc.startsWith("http") ? avatarSrc : cdnUrl(avatarSrc)}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </Link>
          </>
        ) : (
          <Link href="/auth/login" className="topbar-login">
            Kirish
          </Link>
        )}
      </div>
    </header>
  );
}
