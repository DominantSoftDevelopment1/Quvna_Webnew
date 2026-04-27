"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Moon } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cdnUrl } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

const navItems = [
  { href: "/",        label: "Asosiy",   icon: "/icons/game.svg"    },
  { href: "/videos",  label: "Videolar", icon: "/icons/video.svg"   },
  { href: "/stream",  label: "Go Live",  icon: "/icons/stream.svg"  },
  { href: "/miniapp", label: "Mini App", icon: "/icons/store.svg"   },
  { href: "/profile", label: "Profil",   icon: "/icons/profile.svg" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isCompactSidebar =
    pathname.startsWith("/stream") || pathname.startsWith("/videos/efirlar/");

  const { user } = useAuthStore();
  const userId = user?.id != null ? Number(user.id) : null;
  const { data: profile } = useProfile(userId);
  const [darkMode, setDarkMode] = useState(true);
  const [showVideosFlyout, setShowVideosFlyout] = useState(false);
  const [selectedFlyoutItem, setSelectedFlyoutItem] = useState<string | null>(null);
  const openFlyoutTimeoutRef = useRef<number | null>(null);
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

  const openFlyoutWithDelay = () => {
    if (openFlyoutTimeoutRef.current) {
      window.clearTimeout(openFlyoutTimeoutRef.current);
    }
    openFlyoutTimeoutRef.current = window.setTimeout(() => {
      setShowVideosFlyout(true);
    }, 140);
  };

  const closeFlyoutNow = () => {
    if (openFlyoutTimeoutRef.current) {
      window.clearTimeout(openFlyoutTimeoutRef.current);
      openFlyoutTimeoutRef.current = null;
    }
    setShowVideosFlyout(false);
  };

  const handleSidebarMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (next?.closest(".videos-hover-flyout")) return;
    closeFlyoutNow();
  };

  useEffect(() => {
    document.body.classList.toggle("stream-compact-sidebar", isCompactSidebar);
    return () => {
      document.body.classList.remove("stream-compact-sidebar");
      if (openFlyoutTimeoutRef.current) {
        window.clearTimeout(openFlyoutTimeoutRef.current);
      }
    };
  }, [isCompactSidebar]);

  return (
    <aside className="sidebar" onMouseLeave={handleSidebarMouseLeave}>
      {/* Logo */}
      <Link href="/" className="sidebar-logo">
        <img src="/quvna_logo.png" alt="Quvna" width={40} height={40} className="rounded-lg shrink-0" />
        <img src="/icons/text_quvna.svg" alt="Quvna" className="sidebar-logo-text" />
      </Link>

      {/* Nav */}
      <nav className="sidebar-nav" style={{ flex: 1 }}>
        {navItems.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isVideos = href === "/videos";
          return (
            <div
              key={href}
              className="sidebar-nav-item-wrap"
              onMouseEnter={() => {
                if (isVideos && !isCompactSidebar) {
                  openFlyoutWithDelay();
                } else {
                  closeFlyoutNow();
                }
              }}
            >
              <Link
                href={href}
                className={`sidebar-nav-item${active ? " active" : ""}`}
                data-label={label}
              >
                {href === "/profile" ? (
                  avatarSrc ? (
                    <img
                      src={avatarSrc.startsWith("http") ? avatarSrc : cdnUrl(avatarSrc)}
                      alt={displayName}
                      width={28}
                      height={28}
                      className={`sidebar-nav-avatar${active ? " active" : ""}`}
                    />
                  ) : (
                    <span className={`sidebar-nav-avatar-fallback${active ? " active" : ""}`}>{avatarLetter}</span>
                  )
                ) : (
                  <img
                    src={icon}
                    alt=""
                    width={20}
                    height={20}
                    className={`sidebar-nav-icon${active ? " active" : ""}`}
                  />
                )}
                {label}
              </Link>
            </div>
          );
        })}
      </nav>

      {showVideosFlyout && !isCompactSidebar && (
        <div
          className="videos-hover-flyout"
          onMouseEnter={() => setShowVideosFlyout(true)}
          onMouseLeave={closeFlyoutNow}
        >
          <div className="videos-hover-head">Bo&apos;limlar</div>
          <div className="videos-hover-list">
            <Link
              href="/videos/efirlar"
              className={`videos-hover-item${selectedFlyoutItem === "Efirlar" ? " active" : ""}`}
              onClick={() => setSelectedFlyoutItem("Efirlar")}
            >
              Efirlar
            </Link>

            <Link
              href="/videos"
              className={`videos-hover-item${selectedFlyoutItem === "Videolar" ? " active" : ""}`}
              onClick={() => setSelectedFlyoutItem("Videolar")}
            >
              Videolar
            </Link>

            <Link
              href="/videos/ilmiy"
              className={`videos-hover-item${selectedFlyoutItem === "Ilmiy" ? " active" : ""}`}
              onClick={() => setSelectedFlyoutItem("Ilmiy")}
            >
              Ilmiy
            </Link>

            <Link
              href="/videos/obunalar"
              className={`videos-hover-item${selectedFlyoutItem === "Obunalar" ? " active" : ""}`}
              onClick={() => setSelectedFlyoutItem("Obunalar")}
            >
              Obunalar
            </Link>
          </div>
        </div>
      )}

      {/* Dark mode toggle — sidebar pastida */}
      <div
        onClick={() => setDarkMode(!darkMode)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", cursor: "pointer", borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Moon size={20} style={{ color: "var(--primary)" }} />
          <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Tungi rejim</span>
        </div>
        <div style={{
          position: "relative", width: 48, height: 28, borderRadius: 999,
          background: darkMode ? "var(--primary)" : "var(--bg-card2)", transition: "background 0.2s",
        }}>
          <div style={{
            position: "absolute", top: 3, width: 22, height: 22, borderRadius: "50%",
            background: "#fff", transition: "left 0.2s",
            left: darkMode ? 23 : 3,
          }} />
        </div>
      </div>
    </aside>
  );
}
