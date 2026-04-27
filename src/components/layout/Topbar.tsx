"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { cdnUrl } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";

export function Topbar() {
  const { user, isLoggedIn } = useAuthStore();
  const userId = user?.id != null ? Number(user.id) : null;
  const { data: profile } = useProfile(userId);
  const { data: unreadCount = 0 } = useUnreadCount();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const p = (profile ?? {}) as {
    fullName?: string;
    firstName?: string;
    username?: string;
    avatar?: string;
    attachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
  };
  const displayName = p.fullName || p.firstName || p.username || user?.fullName || user?.firstName || user?.username || "User";
  const avatarSrc =
    p.avatar || p.attachmentResponseDTO?.preSignedUrl || p.attachmentResponseDTO?.contentURL ||
    user?.avatar || user?.attachmentResponseDTO?.preSignedUrl || user?.attachmentResponseDTO?.contentURL;
  const avatarLetter = displayName.trim().charAt(0).toUpperCase() || "U";

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
        {/* Rating always visible */}
        <Link href="/rating" className="topbar-rating-btn" aria-label="Reyting">
          <img src="/icons/star.svg" alt="" width={22} height={22} className="topbar-rating-star" />
        </Link>

        {/* Notifications always visible */}
        <Link href="/notifications" className="topbar-notif-btn" aria-label="Bildirishnomalar">
          <img src="/icons/notification.svg" alt="" width={20} height={20} className="icon-muted" />
          {unreadCount > 0 && <span className="topbar-notif-dot" />}
        </Link>

        {mounted && isLoggedIn() ? (
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
