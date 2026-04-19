"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile, useFollowers, useFollowing, useUserVideos } from "@/hooks/useProfile";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Play,
  LogOut,
  Settings,
  Gift,
  History,
  Users,
  Moon,
  Globe,
  Info,
  HelpCircle,
  ChevronRight,
  Star,
  Edit3,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const router = useRouter();

  const demoUserId = 1;
  const userId = user?.id ?? demoUserId;

  return <ProfileContent userId={userId} isLoggedIn={isLoggedIn()} onLogout={() => { logout(); router.push("/"); }} />;
}

function ProfileContent({ userId, isLoggedIn, onLogout }: { userId: number | null; isLoggedIn: boolean; onLogout: () => void }) {
  const { data: profile, isLoading } = useProfile(userId);
  const { data: followers = [] } = useFollowers(userId);
  const { data: following = [] } = useFollowing(userId);
  const { data: videos = [], isLoading: videosLoading } = useUserVideos(userId);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "videos">("overview");

  if (isLoading) return <ProfileSkeleton />;

  const p = profile ?? {};
  const fullName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.username ?? "Foydalanuvchi");
  const avatarUrl = p.attachmentResponseDTO?.preSignedUrl ?? p.attachmentResponseDTO?.contentURL ?? null;
  const bannerUrl = p.userBannerAttachmentResponseDTO?.preSignedUrl ?? p.userBannerAttachmentResponseDTO?.contentURL ?? null;

  return (
    <div className="w-full max-w-xl mx-auto pb-10" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
      {/* ===== HEADER CARD ===== */}
      <div className="rounded-3xl overflow-hidden mb-6" style={{ background: "var(--bg-card)" }}>
        {/* Cover image */}
        <div className="h-44 sm:h-56 relative">
          {bannerUrl ? (
            <img src={cdnUrl(bannerUrl)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1a3a2f 0%, #0d1f17 100%)" }} />
          )}
          <button className="absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: "rgba(0,0,0,0.6)", color: "#fff", backdropFilter: "blur(8px)" }}>
            <Edit3 size={14} />
            Tahrirlash
          </button>
        </div>

        <div className="px-5 pb-6 -mt-12 relative">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 overflow-hidden shrink-0"
            style={{ borderColor: "var(--bg-card)", background: "var(--bg-card2)" }}>
            {avatarUrl ? (
              <img src={cdnUrl(avatarUrl)} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ color: "var(--primary)", background: "var(--bg-card2)" }}>
                {fullName[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>

          {/* Name + Rating */}
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {fullName}
              </h1>
              {p.rating && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ background: "var(--primary)", color: "var(--primary-text)" }}>
                  <Star size={12} fill="currentColor" />
                  {p.rating}
                </span>
              )}
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              ID: {p.id ?? userId}
            </p>
            {p.bio && (
              <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {p.bio}
              </p>
            )}
          </div>

          {/* Social links */}
          {(p.telegramUrl || p.instagramUrl || p.youtubeUrl) && (
            <div className="flex gap-3 mt-4">
              {p.telegramUrl && (
                <a href={p.telegramUrl} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--bg-card2)" }}>
                  <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6 object-contain" />
                </a>
              )}
              {p.instagramUrl && (
                <a href={p.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--bg-card2)" }}>
                  <img src="/icons/instagram.png" alt="Instagram" className="w-6 h-6 object-contain" />
                </a>
              )}
              {p.youtubeUrl && (
                <a href={p.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--bg-card2)" }}>
                  <img src="/icons/youtube.png" alt="YouTube" className="w-6 h-6 object-contain" />
                </a>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-8 mt-5">
            <Stat label="Postlar" value={formatCount(videos.length)} />
            <Stat label="Obunachilar" value={formatCount(p.followerCount ?? followers.length)} />
            <Stat label="Obunalar" value={formatCount(p.followingCount ?? following.length)} />
          </div>

          {/* Game info cards */}
          {(p.playName || p.freeFireName || p.mobileLegendsName) && (
            <div className="grid grid-cols-2 gap-3 mt-5">
              {p.playName && (
                <div className="rounded-2xl p-4" style={{ background: "var(--bg-card2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 size={14} style={{ color: "var(--primary)" }} />
                    <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-muted)" }}>PUBG MOBILE</span>
                  </div>
                  <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{p.playName}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>UID: {p.gameID ?? "-"}</p>
                </div>
              )}
              {p.freeFireName && (
                <div className="rounded-2xl p-4" style={{ background: "var(--bg-card2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 size={14} style={{ color: "var(--primary)" }} />
                    <span className="text-xs font-semibold tracking-wide" style={{ color: "var(--text-muted)" }}>FREE FIRE</span>
                  </div>
                  <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{p.freeFireName}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>UID: {p.freeFireUID ?? "-"}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-2 mb-4 p-1.5 rounded-xl" style={{ background: "var(--bg-card)", marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab("overview")}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: activeTab === "overview" ? "var(--primary)" : "transparent",
            color: activeTab === "overview" ? "var(--primary-text)" : "var(--text-secondary)",
          }}
        >
          Umumiy
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: activeTab === "videos" ? "var(--primary)" : "transparent",
            color: activeTab === "videos" ? "var(--primary-text)" : "var(--text-secondary)",
          }}
        >
          Videolarim
        </button>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* ===== MENU LIST ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MenuItem icon={<Gift size={20} />} label="Quvna bonus" href="/profile/bonus" />
            <MenuItem icon={<History size={20} />} label="Tarix" href="/profile/history" />
            <MenuItem icon={<Users size={20} />} label="Mening klubim" href="/profile/club" />

            {/* Tungi rejim - toggle */}
            <div className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer"
              style={{ background: "var(--bg-card)" }}
              onClick={() => setDarkMode(!darkMode)}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--bg-card2)", color: "var(--primary)" }}>
                  <Moon size={20} />
                </div>
                <span className="text-base font-medium" style={{ color: "var(--text-primary)" }}>Tungi rejim</span>
              </div>
              <div className="w-12 h-7 rounded-full relative transition-colors"
                style={{ background: darkMode ? "var(--primary)" : "var(--bg-card2)" }}>
                <div className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: darkMode ? "25px" : "3px" }} />
              </div>
            </div>

            <MenuItem icon={<Settings size={20} />} label="Sozlamalar" href="/profile/settings" />
            <MenuItem icon={<Globe size={20} />} label="Til" href="/profile/language" />
            <MenuItem icon={<Info size={20} />} label="Quvna haqida" href="/profile/about" />
            <MenuItem icon={<HelpCircle size={20} />} label="Qo'llab-quvvatlash" href="/profile/support" />
          </div>

          {/* ===== LOGOUT BUTTON ===== */}
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="w-full mt-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "var(--bg-card)", color: "var(--error)" }}
            >
              <LogOut size={16} />
              Chiqish
            </button>
          )}

          {/* Version */}
          <p className="text-center text-xs mt-4 mb-4" style={{ color: "var(--text-muted)" }}>
            Ilova versiyasi: 1.0.125
          </p>
        </>
      ) : (
        /* ===== VIDEOS TAB ===== */
        <div>
          {videosLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[9/16] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Play size={56} style={{ color: "var(--text-muted)" }} />
              <p className="text-base" style={{ color: "var(--text-muted)" }}>Hali video yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {videos.map((v: VideoItem) => (
                <div key={v.id} className="cursor-pointer group">
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden mb-2">
                    {v.thumbnailUrl || v.thumbnail ? (
                      <img
                        src={cdnUrl(v.thumbnailUrl ?? v.thumbnail)}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-card2)" }}>
                        <Play size={28} style={{ color: "var(--text-muted)" }} />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1"
                      style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                      <Play size={14} fill="currentColor" />
                      <span className="text-sm font-medium">{formatCount(v.viewCount ?? 0)}</span>
                    </div>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>{v.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href}
      className="flex items-center justify-between px-5 py-4 rounded-2xl transition-colors"
      style={{ background: "var(--bg-card)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "var(--bg-card2)", color: "var(--primary)" }}>
          {icon}
        </div>
        <span className="text-base font-medium" style={{ color: "var(--text-primary)" }}>{label}</span>
      </div>
      <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto pb-10 px-4 sm:px-6">
      <div className="rounded-3xl overflow-hidden mb-6" style={{ background: "var(--bg-card)" }}>
        <Skeleton className="h-44 sm:h-56" />
        <div className="px-5 pb-6 -mt-12 relative space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-8">
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-20" />
            <Skeleton className="h-12 w-20" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

interface VideoItem {
  id: number;
  title: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  viewCount?: number;
}
