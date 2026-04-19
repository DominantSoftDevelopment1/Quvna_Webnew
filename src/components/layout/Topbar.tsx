"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { cdnUrl } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useNotifications";

export function Topbar() {
  const { user, isLoggedIn } = useAuthStore();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <header className="topbar">
      {/* Mobile logo */}
      <Link href="/" className="topbar-logo lg:hidden">
        <img src="/quvna_logo.png" alt="Quvna" width={32} height={32} className="rounded-lg" />
        <img src="/icons/text_quvna.svg" alt="Quvna" className="topbar-logo-text" />
      </Link>

      {/* Search */}
      <div className="topbar-search hidden sm:flex">
        <img src="/icons/search.svg" alt="" width={16} height={16} className="topbar-search-icon" />
        <input type="text" placeholder="Qidirish..." />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile search */}
        <button type="button" className="topbar-btn sm:hidden" aria-label="Qidirish">
          <img src="/icons/search.svg" alt="" width={20} height={20} className="topbar-search-icon" />
        </button>

        {/* Rating always visible */}
        <Link href="/rating" className="topbar-rating-btn" aria-label="Reyting">
          <img src="/icons/star.svg" alt="" width={22} height={22} className="topbar-rating-star" />
        </Link>

        {/* Notifications always visible */}
        <Link href="/notifications" className="topbar-notif-btn" aria-label="Bildirishnomalar">
          <img src="/icons/notification.svg" alt="" width={20} height={20} className="icon-muted" />
          {unreadCount > 0 && <span className="topbar-notif-dot" />}
        </Link>

        {isLoggedIn() ? (
          <>
            <Link href="/profile" className="topbar-avatar">
              {user?.avatar ? (
                <img src={cdnUrl(user.avatar)} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user?.username?.[0]?.toUpperCase() ?? "U"
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
