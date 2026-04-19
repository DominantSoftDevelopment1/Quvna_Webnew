"use client";

import { useState, useEffect } from "react";
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
  ChevronLeft,
  Star,
  Edit3,
  Gamepad2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  const demoUserId = 1;
  const userId = user?.id ? Number(user.id) : demoUserId;

  return <ProfileContent userId={userId} isLoggedIn={isLoggedIn()} onLogout={() => { logout(); router.push("/"); }} />;
}

function ProfileContent({ userId, isLoggedIn, onLogout }: { userId: number | null; isLoggedIn: boolean; onLogout: () => void }) {
  const { data: profile, isLoading } = useProfile(userId);
  const { data: followers = [] } = useFollowers(userId);
  const { data: following = [] } = useFollowing(userId);
  const { data: videos = [], isLoading: videosLoading } = useUserVideos(userId);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "videos">("overview");
  const cardsRef = useRef<HTMLDivElement>(null);

  const scrollCards = (dir: "left" | "right") => {
    if (cardsRef.current) {
      cardsRef.current.scrollBy({ left: dir === "right" ? 180 : -180, behavior: "smooth" });
    }
  };

  if (isLoading && !profile) return <ProfileSkeleton />;

  const p = profile ?? {};
  const fullName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.username ?? "Foydalanuvchi");
  const avatarUrl = p.attachmentResponseDTO?.preSignedUrl ?? p.attachmentResponseDTO?.contentURL ?? null;
  const bannerUrl = p.userBannerAttachmentResponseDTO?.preSignedUrl ?? p.userBannerAttachmentResponseDTO?.contentURL ?? null;

  return (
    <div className="w-full mx-auto pb-10" style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
      {/* ===== HEADER CARD + TABS — bitta card ===== */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)", marginBottom: 16 }}>

        {/* Banner — katta, sahifa orqa foniga blur effekti */}
        <div className="relative" style={{ height: 200 }}>
          {/* Orqa fon blur — banner rangi sahifaga singadi */}
          {bannerUrl && (
            <div className="absolute inset-0 scale-110"
              style={{ backgroundImage: `url(${cdnUrl(bannerUrl)})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px) brightness(0.4)", transform: "scale(1.1)" }} />
          )}
          {/* Asosiy banner rasmi */}
          {bannerUrl ? (
            <img src={cdnUrl(bannerUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1a3a2f 0%, #0d1f17 100%)" }} />
          )}
          {/* Pastga gradient overlay — avatar ustiga */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />

          {/* Tahrirlash tugmasi — 5px chapga */}
          <button type="button" className="absolute top-4 flex items-center gap-1.5 text-xs font-medium"
            style={{ right: "calc(1rem - 5px)", color: "rgba(255,255,255,0.85)" }}>
            <Edit3 size={13} />
            Tahrirlash
          </button>

          {/* Avatar + Ism + Rating — banner pastki qismida, 5px yuqoriroq */}
          <div className="absolute left-0 right-0 flex items-end justify-between px-4 gap-3"
            style={{ bottom: 10 }}>
            <div className="flex items-end gap-3">
              {/* Avatar — 5px o'ngga */}
              <div className="relative shrink-0" style={{ marginBottom: 10, marginLeft: 5 }}>
                <div className="w-[72px] h-[72px] rounded-full overflow-hidden"
                  style={{ border: "2.5px solid rgba(255,255,255,0.25)", background: "var(--bg-card2)" }}>
                  {avatarUrl ? (
                    <img src={cdnUrl(avatarUrl)} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                      style={{ color: "var(--primary)", background: "var(--bg-card2)" }}>
                      {fullName[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)", border: "1.5px solid rgba(255,255,255,0.2)" }}>
                  <Edit3 size={9} style={{ color: "#fff" }} />
                </div>
              </div>
              {/* Ism + ID — 5px yuqoriroq */}
              <div style={{ marginBottom: 5 }}>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-bold text-white">{fullName}</h1>
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#4FC3F7"/>
                    <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>ID: {p.id ?? userId}</p>
              </div>
            </div>
            {/* Rating badge — 5px yuqoriroq */}
            <div className="flex items-center gap-2 shrink-0"
              style={{ background: "rgba(27,58,42,0.9)", borderRadius: 20, padding: "6px 12px", backdropFilter: "blur(8px)", marginBottom: 10, marginRight: 10 }}>
              <Star size={15} fill="#F59E0B" style={{ color: "#F59E0B" }} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{p.rating ?? 125}</span>
            </div>
          </div>
        </div>

        <div className="pb-5 relative" style={{ paddingLeft: 16, paddingRight: 16 }}>

          {/* Bio — 16px past */}
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)", marginTop: 16 }}>
            {p.bio ?? "How Beyond The Summit Marries Professional Production With Grassroots Atmosphere. Grassroots👀 #Dota2"}
          </p>

          {/* Stats — bio/ism dan 16px past */}
          <div className="flex gap-6" style={{ marginTop: 16 }}>
            <Stat label="Postlar" value={formatCount(videos.length)} />
            <Stat label="Obunachilar" value={formatCount(p.followerCount ?? followers.length)} />
            <Stat label="Obunalar" value={formatCount(p.followingCount ?? following.length)} />
          </div>

          {/* Social links — stats dan 16px past */}
          <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
            <a href={p.telegramUrl ?? "#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-card2)", color: "var(--text-secondary)" }}>
              <img src="/icons/telegram.png" alt="" className="w-3.5 h-3.5 object-contain" />
              Telegram
            </a>
            <a href={p.instagramUrl ?? "#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-card2)", color: "var(--text-secondary)" }}>
              <img src="/icons/instagram.png" alt="" className="w-3.5 h-3.5 object-contain" />
              Instagram
            </a>
            <a href={p.youtubeUrl ?? "#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-card2)", color: "var(--text-secondary)" }}>
              <img src="/icons/youtube.png" alt="" className="w-3.5 h-3.5 object-contain" />
              YouTube
            </a>
            <a href={p.donationAlertsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-card2)", color: "var(--text-secondary)" }}>
              <Gamepad2 size={12} style={{ color: "var(--primary)" }} />
              Donation Alerts
            </a>
          </div>

          {/* Game rating cards — 4 ta, swipe, scrollbar yo'q */}
          {/* Cards + nav arrows */}
          <div className="relative" style={{ marginTop: 16, marginLeft: -16, marginRight: -16 }}>
            {/* Left arrow */}
            <button type="button" aria-label="Chapga" onClick={() => scrollCards("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff", backdropFilter: "blur(4px)" }}>
              <ChevronLeft size={16} />
            </button>
            {/* Scrollable row */}
            <div ref={cardsRef} className="flex overflow-x-auto"
              style={{ gap: '16px', paddingLeft: 16, paddingRight: 16, scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <RatingCard title="PUBG MOBILE"    rating={p.rating ?? 125} name={p.playName ?? "Azimovas"}            uid={p.gameID ?? "5971521"}           total={p.totalScore ?? "1 571"} />
              <RatingCard title="MOBILE LEGENDS" rating={p.rating ?? 125} name={p.mobileLegendsName ?? "Azimovas"}   uid={p.mobileLegendsUID ?? "5971521"} total="2 340" />
              <RatingCard title="FREE FIRE"      rating={p.rating ?? 125} name={p.freeFireName ?? "Azimovas"}        uid={p.freeFireUID ?? "5971521"}      total="892" />
              <RatingCard title="STEAM"          rating={p.rating ?? 125} name={p.playName ?? "Azimovas"}            uid={p.gameID ?? "5971521"}           total="450" />
            </div>
            {/* Right arrow */}
            <button type="button" aria-label="O'ngga" onClick={() => scrollCards("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
              style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.45)", color: "#fff", backdropFilter: "blur(4px)" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ===== TABS — card ichida, 16px pastda ===== */}
        <div className="flex" style={{ marginTop: 16, marginBottom: 4, height: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className="flex-1 flex items-center justify-center text-sm font-semibold transition-all relative"
            style={{ color: activeTab === "overview" ? "var(--primary)" : "var(--text-muted)" }}
          >
            Umumiy
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full" style={{ background: "var(--primary)" }} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className="flex-1 flex items-center justify-center text-sm font-semibold transition-all relative"
            style={{ color: activeTab === "videos" ? "var(--primary)" : "var(--text-muted)" }}
          >
            Videolarim
            {activeTab === "videos" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 rounded-full" style={{ background: "var(--primary)" }} />
            )}
          </button>
        </div>
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
    <div>
      <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
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

function RatingCard({ title, rating, name, uid, total }: {
  title: string;
  rating: number;
  name: string;
  uid: string;
  total: string;
}) {
  return (
    <div className="rounded-2xl shrink-0 flex flex-col justify-between"
      style={{ background: "#1B5E3B", width: 200, minHeight: 120, padding: "14px 16px" }}>

      {/* Top: title + ⭐ rating */}
      <div className="flex items-center justify-between gap-1">
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "0.03em" }}>
          {title}
        </span>
        <span className="flex items-center gap-1 rounded-xl shrink-0"
          style={{ background: "#0D3B26", padding: "4px 10px", fontSize: 14, fontWeight: 700, color: "#fff" }}>
          <Star size={13} fill="#F59E0B" style={{ color: "#F59E0B" }} />
          {rating}
        </span>
      </div>

      {/* Middle: Name */}
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 12 }}>
        Name: <span style={{ fontWeight: 700, color: "#fff" }}>{name}</span>
      </p>

      {/* Bottom: UID + Total */}
      <div className="flex items-end justify-between" style={{ marginTop: 8 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          UID: <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{uid}</span>
        </p>
        <div className="text-right">
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1 }}>Total</p>
          <p style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1, marginTop: 2 }}>{total}</p>
        </div>
      </div>
    </div>
  );
}
