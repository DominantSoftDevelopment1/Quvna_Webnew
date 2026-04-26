"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile, useFollowers, useFollowing, useUserVideos } from "@/hooks/useProfile";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { VideoTermsModal } from "@/components/videos/VideoTermsModal";
import {
  Play,
  Film,
  Heart,
  Eye,
  Plus,
  LogOut,
  Settings,
  Gift,
  History,
  Users,
  Globe,
  Info,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

function dashDisplay(v: unknown): string {
  if (v == null) return "—";
  const s = String(v).trim();
  return s.length > 0 ? s : "—";
}

function formatGameAmount(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return "—";
  return formatCount(n);
}

/** Tashqi havolada shema bo‘lmasa — brauzer noto‘g‘ri manzilga olib bormasligi uchun */
function safeExternalUrl(url: string): string {
  const t = url.trim();
  if (!t) return "#";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("mailto:") || t.startsWith("tel:")) return t;
  return `https://${t}`;
}

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
  const { data: followersRaw = [] } = useFollowers(userId);
  const { data: followingRaw = [] } = useFollowing(userId);
  const { data: videosRaw = [], isLoading: videosLoading } = useUserVideos(userId);
  const followers = Array.isArray(followersRaw) ? followersRaw : [];
  const following = Array.isArray(followingRaw) ? followingRaw : [];
  const videos = Array.isArray(videosRaw) ? videosRaw : [];
  const [activeTab, setActiveTab] = useState<"overview" | "videos">("overview");
  const [showVideoTermsNotice, setShowVideoTermsNotice] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showRestrictionsCard, setShowRestrictionsCard] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [restrictionSeconds, setRestrictionSeconds] = useState(30);
  const [activeRestrictionId, setActiveRestrictionId] = useState<string | null>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const videoTermsSeenKey = `profile_video_terms_seen_v1_${userId ?? "guest"}`;
  const restrictionsSeenKey = `profile_video_restrictions_seen_v1_${userId ?? "guest"}`;

  const scrollCards = (dir: "left" | "right") => {
    if (cardsRef.current) {
      cardsRef.current.scrollBy({ left: dir === "right" ? 180 : -180, behavior: "smooth" });
    }
  };

  const openVideosTabWithNotice = () => {
    setActiveTab("videos");
    setActiveRestrictionId(null);

    const termsSeen = window.localStorage.getItem(videoTermsSeenKey) === "1";
    const restrictionsSeen = window.localStorage.getItem(restrictionsSeenKey) === "1";

    if (termsSeen) {
      setAcceptedTerms(true);
      setShowVideoTermsNotice(false);
      if (!restrictionsSeen) {
        setShowRestrictionsCard(true);
        setRestrictionSeconds(30);
        window.localStorage.setItem(restrictionsSeenKey, "1");
      } else {
        setShowRestrictionsCard(false);
      }
      return;
    }

    setAcceptedTerms(false);
    setShowRestrictionsCard(false);
    setShowVideoTermsNotice(true);
  };

  const closeVideoTermsNotice = () => {
    setShowVideoTermsNotice(false);
    setActiveTab("videos");
    setAcceptedTerms(true);
    window.localStorage.setItem(videoTermsSeenKey, "1");

    const restrictionsSeen = window.localStorage.getItem(restrictionsSeenKey) === "1";
    if (!restrictionsSeen) {
      setShowRestrictionsCard(true);
      setRestrictionSeconds(30);
      window.localStorage.setItem(restrictionsSeenKey, "1");
    } else {
      setShowRestrictionsCard(false);
    }
  };

  useEffect(() => {
    if (!showRestrictionsCard) return;
    const intervalId = window.setInterval(() => {
      setRestrictionSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          setShowRestrictionsCard(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [showRestrictionsCard]);

  useEffect(() => {
    if (!activeRestrictionId) return;
    const timeoutId = window.setTimeout(() => {
      setActiveRestrictionId(null);
    }, 5000);
    return () => window.clearTimeout(timeoutId);
  }, [activeRestrictionId]);

  if (isLoading && !profile) return <ProfileSkeleton />;

  const p = (profile ?? {}) as {
    firstName?: string;
    lastName?: string;
    username?: string;
    id?: number;
    bio?: string;
    rating?: unknown;
    totalScore?: unknown;
    attachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
    userBannerAttachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
    followerCount?: number;
    followingCount?: number;
    playName?: string;
    gameID?: string;
    mobileLegendsName?: string;
    mobileLegendsUID?: string;
    freeFireName?: string;
    freeFireUID?: string;
    steamName?: string;
    telegramUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    facebookUrl?: string;
    discordUrl?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
    donationAlertsUrl?: string;
    websiteUrl?: string;
  };
  const fullName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : (p.username ?? "Foydalanuvchi");
  const avatarUrl = p.attachmentResponseDTO?.preSignedUrl ?? p.attachmentResponseDTO?.contentURL ?? null;
  const bannerUrl = p.userBannerAttachmentResponseDTO?.preSignedUrl ?? p.userBannerAttachmentResponseDTO?.contentURL ?? null;
  // rating: umumiy ball yoki { ucAmount, mlamount, ffAmount, steamAmount }
  const ratingObj =
    typeof p.rating === "object" && p.rating != null && !Array.isArray(p.rating)
      ? (p.rating as Record<string, number>)
      : null;
  const ratingScore = ratingObj
    ? Number(ratingObj.ucAmount ?? 0)
    : typeof p.rating === "number"
      ? p.rating
      : 0;
  const ucR = Number(ratingObj?.ucAmount ?? ratingScore);
  const mlR = Number(ratingObj?.mlamount ?? (ratingObj as { mlAmount?: number })?.mlAmount ?? 0);
  const ffR = Number(ratingObj?.ffAmount ?? 0);
  const stR = Number(ratingObj?.steamAmount ?? 0);
  const steamId =
    (p as { steamId?: string; steamUID?: string }).steamId ?? (p as { steamId?: string; steamUID?: string }).steamUID;
  const restrictionProgress = Math.max(0, (restrictionSeconds / 30) * 100);
  const showRestrictionFocus = restrictionSeconds >= 28;

  return (
    <div
      className="w-full mx-auto pb-24 lg:pb-10 min-h-[calc(100dvh-96px)]"
      style={{ maxWidth: '960px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}
    >
      {/* ===== HEADER CARD + TABS — bitta card ===== */}
      <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)", marginBottom: 16 }}>

        {/* Banner — katta, sahifa orqa foniga blur effekti */}
        <div className="relative" style={{ height: 230 }}>
          {/* Orqa fon blur — banner rangi sahifaga singadi */}
          {bannerUrl && (
            <div className="absolute inset-0 scale-110"
              style={{ backgroundImage: `url(${cdnUrl(bannerUrl)})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(40px) brightness(0.4)", transform: "scale(1.1)" }} />
          )}
          {/* Asosiy banner rasmi */}
          {bannerUrl ? (
            <img src={cdnUrl(bannerUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-black" />
          )}
          {/* Pastga gradient overlay — avatar ustiga */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />

          {/* Tahrirlash tugmasi — 5px chapga */}
          <Link href="/profile/edit" className="absolute top-4 flex items-center gap-1.5 text-xs font-medium"
            style={{ right: "calc(1rem - 5px)", color: "rgba(255,255,255,0.85)" }}>
            <Edit3 size={13} />
            Tahrirlash
          </Link>

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
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{ratingScore}</span>
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

          {/* Ijtimoiy tarmoqlar — ikonlar public/icons (quvna_icon to‘plami bilan mos) */}
          <div className="flex flex-wrap gap-3" style={{ marginTop: 16 }}>
            {(
              [
                { url: p.telegramUrl, label: "Telegram", icon: "/icons/telegram.svg" },
                { url: p.instagramUrl, label: "Instagram", icon: "/icons/instagram.svg" },
                { url: p.youtubeUrl, label: "YouTube", icon: "/icons/youtube.svg" },
                { url: p.tiktokUrl, label: "TikTok", icon: "/icons/tiktok.svg" },
                { url: p.facebookUrl, label: "Facebook", icon: "/icons/facebook.svg" },
                { url: p.discordUrl, label: "Discord", icon: "/icons/discord.svg" },
                { url: p.linkedinUrl, label: "LinkedIn", icon: "/icons/linkedin.svg" },
                { url: p.twitterUrl, label: "X", icon: "/icons/twitter.svg" },
                { url: p.donationAlertsUrl, label: "Donation Alerts", icon: "/icons/donation-alerts.svg" },
                { url: p.websiteUrl, label: "Veb-sayt", icon: "/icons/internet.svg" },
              ] as const
            )
              .filter((row) => typeof row.url === "string" && row.url.trim().length > 0)
              .map((row) => (
                <a
                  key={row.label}
                  href={safeExternalUrl(String(row.url))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ background: "var(--bg-card2)", color: "var(--text-secondary)" }}
                >
                  <img src={row.icon} alt="" className="h-5 w-5 object-contain" width={20} height={20} />
                  {row.label}
                </a>
              ))}
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
              <RatingCard title="PUBG MOBILE"    rating={ucR}  name={dashDisplay(p.playName)}           uid={dashDisplay(p.gameID)}              total={formatGameAmount(ucR || Number(p.totalScore) || 0)} />
              <RatingCard title="MOBILE LEGENDS" rating={mlR}  name={dashDisplay(p.mobileLegendsName)}  uid={dashDisplay(p.mobileLegendsUID)}    total={formatGameAmount(mlR)} />
              <RatingCard title="FREE FIRE"      rating={ffR}  name={dashDisplay(p.freeFireName)}        uid={dashDisplay(p.freeFireUID)}         total={formatGameAmount(ffR)} />
              <RatingCard title="STEAM"          rating={stR}  name={dashDisplay(p.steamName)}            uid={dashDisplay(steamId)}               total={formatGameAmount(stR)} />
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
        <div
          className="flex items-stretch"
          style={{ marginTop: 16, marginBottom: 4, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4 }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className="flex-1 h-10 px-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === "overview" ? "var(--primary)" : "var(--text-muted)" }}
          >
            <img
              src="/icons/more-03.svg"
              alt=""
              width={16}
              height={16}
              className={activeTab === "overview" ? "opacity-100" : "opacity-60"}
            />
            Umumiy
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-20 rounded-full" style={{ background: "var(--primary)" }} />
            )}
          </button>
          <button
            type="button"
            onClick={openVideosTabWithNotice}
            className="flex-1 h-10 px-3 flex items-center justify-center gap-2 text-sm font-semibold transition-all relative"
            style={{ color: activeTab === "videos" ? "var(--primary)" : "var(--text-muted)" }}
          >
            <img
              src="/icons/video-replay.svg"
              alt=""
              width={16}
              height={16}
              className={activeTab === "videos" ? "opacity-100" : "opacity-60"}
            />
            Videolarim
            {activeTab === "videos" && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-24 rounded-full" style={{ background: "var(--primary)" }} />
            )}
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* ===== MENU LIST ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <MenuItem icon={<Gift size={20} />} label="Quvna bonus" href="/profile/bonus" />
            <MenuActionItem
              icon={<Play size={20} />}
              label="Videolarim"
              onClick={openVideosTabWithNotice}
            />
            <MenuItem icon={<History size={20} />} label="Tarix" href="/profile/history" />
            <MenuItem icon={<Users size={20} />} label="Mening klubim" href="/profile/club" />

<MenuItem icon={<Settings size={20} />} label="Sozlamalar" href="/profile/settings" />
            <MenuItem icon={<Globe size={20} />} label="Til" href="/profile/language" />
            <MenuItem icon={<Info size={20} />} label="Quvna haqida" href="/profile/about" />
            <MenuItem icon={<HelpCircle size={20} />} label="Qo'llab-quvvatlash" href="/profile/support" />
          </div>

          {/* ===== LOGOUT BUTTON ===== */}
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="w-full rounded-2xl text-base font-semibold flex items-center justify-center gap-3"
              style={{ background: "var(--bg-card)", color: "var(--error)", marginTop: 16, padding: "18px 20px" }}
            >
              <LogOut size={20} />
              Chiqish
            </button>
          )}

          {/* Version */}
          <p className="text-center text-xs" style={{ color: "var(--text-muted)", marginTop: 16, marginBottom: 16 }}>
            Ilova versiyasi: 1.0.125
          </p>
        </>
      ) : (
        /* ===== VIDEOS TAB ===== */
        <div className="space-y-4">
          {acceptedTerms && !showRestrictionsCard && (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0 14px",
                marginTop: 16,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 12,
                  background: "transparent",
                  border: "none",
                  padding: "6px 4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                    <Film size={24} style={{ color: "#1DBF73" }} />
                    54
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                    <Heart size={24} style={{ color: "#1DBF73" }} />
                    1 571
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                    <Eye size={24} style={{ color: "#1DBF73" }} />
                    1M
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateSheet(true)}
                  className="flex items-center gap-1.5 text-[13px] font-medium"
                  style={{
                    color: "#d5d7da",
                    borderRadius: 6,
                    border: "1px solid rgba(255,255,255,0.16)",
                    padding: "8px 10px",
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
                  }}
                >
                  <Plus size={16} />
                  Yaratish
                </button>
              </div>
            </div>
          )}

          {acceptedTerms && showRestrictionsCard && (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "0 14px",
                marginTop: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 18,
                  padding: "18px 16px 16px",
                  background: "rgba(24,24,26,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 16px 38px rgba(0,0,0,0.35)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    color: "#d1d1d6",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: showRestrictionFocus ? "0 0 0 6px rgba(255,176,32,0.18)" : "none",
                    transition: "box-shadow 220ms ease",
                  }}
                >
                  {restrictionSeconds}
                </div>
                <h3
                  style={{
                    margin: "0 36px 18px 0",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: "20px",
                  }}
                >
                  Taqiqlangan kontentlar
                </h3>
                <p
                  style={{
                    margin: "0 0 10px 0",
                    color: "#8e8e93",
                    fontSize: 11,
                    lineHeight: "14px",
                  }}
                >
                  30 soniyalik sanog&apos; ketmoqda
                </p>
                <div
                  style={{
                    width: "100%",
                    height: 4,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    marginBottom: 14,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${restrictionProgress}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #FFB020 0%, #FC363F 100%)",
                      transition: "width 950ms linear",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  {PROHIBITED_CONTENT_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveRestrictionId(card.id)}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={card.icon}
                          alt=""
                          width={26}
                          height={26}
                          style={{
                            width: 26,
                            height: 26,
                            objectFit: "contain",
                            display: "block",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          width: "100%",
                          margin: 0,
                          color: "#e5e5ea",
                          fontSize: 11,
                          lineHeight: "14px",
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "normal",
                        }}
                      >
                        {card.title}
                      </p>
                    </button>
                  ))}
                </div>

                {activeRestrictionId && (
                  <div
                    style={{
                      marginTop: 12,
                      borderRadius: 12,
                      border: "1px solid rgba(252,54,63,0.35)",
                      background: "rgba(255,255,255,0.03)",
                      padding: "10px 12px",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        color: "#FF8B92",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {PROHIBITED_CONTENT_CARDS.find((card) => card.id === activeRestrictionId)?.title}
                    </p>
                    <p
                      style={{
                        margin: "6px 0 0",
                        color: "#d5d7da",
                        fontSize: 11,
                        lineHeight: "15px",
                      }}
                    >
                      {PROHIBITED_CONTENT_CARDS.find((card) => card.id === activeRestrictionId)?.details}
                      {" "}
                      <a
                        href={PROHIBITED_CONTENT_CARDS.find((card) => card.id === activeRestrictionId)?.detailsUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#FFB020", fontWeight: 600 }}
                      >
                        Batafsil
                      </a>
                    </p>
                  </div>
                )}
              </div>
              {activeRestrictionId && <RestrictionToast cardId={activeRestrictionId} />}
            </div>
          )}

          {videosLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-2"
                >
                  <Skeleton className="aspect-[9/16] rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-4">
              <Play size={56} style={{ color: "var(--text-muted)" }} />
              <p className="text-base" style={{ color: "var(--text-muted)" }}>Hali video yo&apos;q</p>
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
      <CreateVideoSheetModal
        isOpen={showCreateSheet}
        onClose={() => setShowCreateSheet(false)}
      />
      <VideoTermsModal
        isOpen={showVideoTermsNotice}
        accepted={acceptedTerms}
        onToggleAccepted={setAcceptedTerms}
        onAccept={closeVideoTermsNotice}
      />
    </div>
  );
}

function MenuItem({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href}
      className="flex items-center justify-between rounded-2xl transition-colors"
      style={{ background: "var(--bg-card)", padding: "18px 20px" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "var(--bg-card2)", color: "var(--primary)" }}>
          {icon}
        </div>
        <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
      </div>
      <ChevronRight size={20} style={{ color: "var(--text-muted)" }} />
    </Link>
  );
}

function MenuActionItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-2xl transition-colors"
      style={{ background: "var(--bg-card)", padding: "18px 20px" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
    >
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: "var(--bg-card2)", color: "var(--primary)" }}>
          {icon}
        </div>
        <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{label}</span>
      </div>
      <ChevronRight size={20} style={{ color: "var(--text-muted)" }} />
    </button>
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
    <div className="w-full max-w-3xl mx-auto pb-10 px-4 sm:px-6">
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

const PROHIBITED_CONTENT_CARDS = [
  {
    id: "adult",
    title: "+18 materiallar",
    icon: "/icons/prohibited/no-18.svg",
    details: "Kattalar uchun mo‘ljallangan materiallarni joylash taqiqlanadi.",
    detailsUrl: "#",
  },
  {
    id: "gambling",
    title: "Qimor o‘yinlari",
    icon: "/icons/prohibited/no-gambling.svg",
    details: "Qimor va pul tikishga undovchi kontent taqiqlanadi.",
    detailsUrl: "#",
  },
  {
    id: "hate",
    title: "Diniy va irqiy nizo",
    icon: "/icons/prohibited/no-hate.svg",
    details: "Diniy yoki irqiy adovat uyg‘otuvchi kontent bloklanadi.",
    detailsUrl: "#",
  },
  {
    id: "substances",
    title: "Alkogol va tamaki",
    icon: "/icons/prohibited/no-alcohol.svg",
    details: "Alkogol va tamaki mahsulotlarini targ‘ib qilish mumkin emas.",
    detailsUrl: "#",
  },
] as const;

function RestrictionToast({ cardId }: { cardId: string }) {
  const activeCard = PROHIBITED_CONTENT_CARDS.find((card) => card.id === cardId);
  if (!activeCard) return null;

  return (
    <div
      className="absolute left-2 right-2 top-full mt-2 rounded-md border px-3 py-2.5 z-10"
      style={{ borderColor: "#FF5A5A", background: "#121315F5", boxShadow: "0 10px 24px rgba(0,0,0,0.45)" }}
    >
      <p className="text-[12px] font-semibold" style={{ color: "#FF7D7D" }}>
        {activeCard.title}
      </p>
      <p className="text-[10px] mt-1 leading-[1.35]" style={{ color: "#d5d7da" }}>
        {activeCard.details}
      </p>
      <p className="text-[9px] mt-1.5" style={{ color: "#9ca3af" }}>
        Auto close: 30s
      </p>
    </div>
  );
}

function CreateVideoSheetModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[375px]"
        style={{ boxSizing: "border-box" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 20,
            background: "#222326",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "12px 16px 16px",
          }}
        >
          <div className="flex justify-center mb-3">
            <div
              style={{
                width: 32,
                height: 4,
                borderRadius: 999,
                background: "rgba(170,178,188,0.35)",
              }}
            />
          </div>

          <p
            style={{
              margin: "0 0 14px 0",
              textAlign: "center",
              color: "#d5d7da",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            Video yuklash
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <button
              type="button"
              style={{
                border: "1px solid #292929",
                background: "#141414",
                borderRadius: 20,
                padding: 16,
                minHeight: 165,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <img src="/icons/short-video-upload.svg" alt="" width={56} height={56} />
              <span style={{ textAlign: "center", fontSize: 14, fontWeight: 500, lineHeight: "18px" }}>
                Qisqa video{"\n"}yuklash
              </span>
            </button>

            <button
              type="button"
              style={{
                border: "1px solid #292929",
                background: "#141414",
                borderRadius: 20,
                padding: 16,
                minHeight: 165,
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <img src="/icons/science-upload.svg" alt="" width={56} height={56} />
              <span style={{ textAlign: "center", fontSize: 14, fontWeight: 500, lineHeight: "18px" }}>
                Ilmiy-ommabop{"\n"}kontent yuklash
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
