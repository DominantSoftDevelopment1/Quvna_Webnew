"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile, useEditProfile } from "@/hooks/useProfile";
import { formatApiError } from "@/lib/updateUserProfile";
import { cdnUrl } from "@/lib/utils";
import { ChevronLeft, Camera, Check, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Section from "@/components/profile/Section";
import Image from "next/image";
import Link from "next/link";

const SECTION_TO_SECTION_GAP_PX = 24;
const GAME_CARD_MAX_WIDTH_PX = 420;
const EDIT_CONTENT_MAX_WIDTH_PX = 500;
// O‘yin ikonkalar: papka resurs/image taxrirlash
//   pubgmobile.png, mobilelegends.png, "fri fair.png" (→ freefire.png), steam.png
// Order: PUBG Mobile → Mobile Legends → Free Fire → Steam
const GAME_TABS = [
  { label: "PUBG Mobile", icon: "/images/profile-games/pubgmobile.png" },
  { label: "Mobile Legends", icon: "/images/profile-games/mobilelegends.png" },
  { label: "Free Fire", icon: "/images/profile-games/freefire.png" },
  { label: "Steam", icon: "/images/profile-games/steam.png" },
];

function strVal(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

export default function EditProfilePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const userId = user?.id ? Number(user.id) : null;
  const { data: profile } = useProfile(userId);
  const { mutate: editProfile, isPending } = useEditProfile();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    gender: "",
    country: "",
    birthDate: "",
    isPrivate: false,
    // Game info
    playName: "",
    gameID: "",
    freeFireName: "",
    freeFireUID: "",
    mobileLegendsName: "",
    mobileLegendsUID: "",
    steamName: "",
    hideGameInfo: false,
    // Social (ikonlar: public/icons — manba papka resurs/.../quvna_icon)
    telegramUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
    discordUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    donationAlertsUrl: "",
    websiteUrl: "",
  });

  const [selectedGame, setSelectedGame] = useState(0);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const p = profile as Record<string, unknown>;
      setFormData({
        firstName: strVal(p.firstName),
        lastName: strVal(p.lastName),
        username: strVal(p.username),
        bio: strVal(p.bio),
        gender: strVal(p.gender),
        country: strVal(p.country),
        birthDate: strVal(p.birthDate),
        isPrivate: Boolean(p.isPrivate),
        playName: strVal(p.playName),
        gameID: strVal(p.gameID),
        freeFireName: strVal(p.freeFireName),
        freeFireUID: strVal(p.freeFireUID),
        mobileLegendsName: strVal(p.mobileLegendsName),
        mobileLegendsUID: strVal(p.mobileLegendsUID),
        steamName: strVal(p.steamName),
        hideGameInfo: Boolean(p.hideGameInfo),
        telegramUrl: strVal(p.telegramUrl),
        instagramUrl: strVal(p.instagramUrl),
        youtubeUrl: strVal(p.youtubeUrl),
        tiktokUrl: strVal(p.tiktokUrl),
        facebookUrl: strVal(p.facebookUrl),
        discordUrl: strVal(p.discordUrl),
        linkedinUrl: strVal(p.linkedinUrl),
        twitterUrl: strVal(p.twitterUrl),
        donationAlertsUrl: strVal(p.donationAlertsUrl),
        websiteUrl: strVal(p.websiteUrl),
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!userId) return;
    setSaveError(null);
    editProfile(
      { userId, data: formData, baseProfile: profile ?? null },
      {
        onError: (e) => setSaveError(formatApiError(e)),
        onSuccess: () => setSaveError(null),
      }
    );
  };

  const pr = profile as
    | {
        attachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
        userBannerAttachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
      }
    | null
    | undefined;
  const avatarUrl = pr?.attachmentResponseDTO?.preSignedUrl ?? pr?.attachmentResponseDTO?.contentURL;
  const bannerUrl = pr?.userBannerAttachmentResponseDTO?.preSignedUrl ?? pr?.userBannerAttachmentResponseDTO?.contentURL;

  if (!userId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-primary)] px-4 text-[var(--text-primary)]">
        <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Profil va o‘yin ma’lumotlarini tahrirlash uchun tizimga kiring.
        </p>
        <Link
          href="/auth/login"
          className="rounded-2xl bg-[var(--primary)] px-6 py-3 text-base font-bold text-black"
        >
          Kirish
        </Link>
        <Link href="/profile" className="text-sm" style={{ color: "var(--text-muted)" }}>
          Profilga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-10" style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-card)", marginBottom: 16 }}>
            {/* Header with banner */}
            <div className="relative h-[220px]">
              {bannerUrl ? (
                <img src={cdnUrl(bannerUrl)} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-green-900 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

              {/* Back button */}
              <button
                onClick={() => router.push('/profile')}
                className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
              >
                <ChevronLeft size={20} />
              </button>

              {/* Edit banner button */}
              <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                <Camera size={18} />
              </button>

              {/* Avatar */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[var(--bg-primary)]">
                    {avatarUrl ? (
                      <img src={cdnUrl(avatarUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--bg-card2)] text-2xl font-bold text-[var(--primary)]">
                        {formData.firstName?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bg-primary)] bg-[var(--primary)] text-black">
                    <Camera size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div
              className="mx-auto w-full px-4 pb-8 pt-0"
              style={{ maxWidth: EDIT_CONTENT_MAX_WIDTH_PX, marginLeft: "auto", marginRight: "auto" }}
            >
              <div>
        {/* Main Info Section */}
        <div style={{ marginTop: 40 }}>
        <Section title="ASOSIY MA'LUMOT">
          <EditableNavRow label="Ism" value={formData.firstName} href="/profile/edit/firstName" />
          <EditableNavRow label="Tahallus" value={formData.username} href="/profile/edit/username" />
          <EditableNavRow label="Tug'ilgan sana" value={formData.birthDate} href="/profile/edit/birthDate" />
          <button
            onClick={() => setShowGenderSheet(true)}
            className="flex min-h-[48px] w-full items-center justify-between border-b py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Jins</span>
            <span className="text-sm font-medium" style={{ color: formData.gender ? "var(--text-primary)" : "var(--text-muted)" }}>
              {formData.gender || "Tanlang"}
            </span>
          </button>
          <EditableNavRow label="Davlat" value={formData.country} href="/profile/edit/country" />
          <EditableNavRow label="O'zim haqimda" value={formData.bio} href="/profile/edit/bio" />

          <SwitchRow
            variant="account"
            label="Yopiq hisob"
            description="Profilingizdagi ma'lumotlar boshqa foydalanuvchilarga ko'rinmaydi"
            checked={formData.isPrivate}
            onChange={(val) => setFormData({ ...formData, isPrivate: val })}
          />
        </Section>
        </div>

        {/* Game Info Section */}
        <div style={{ marginTop: SECTION_TO_SECTION_GAP_PX }}>
        <Section
          title="O'YIN MA'LUMOTLARI"
          cardClassName="box-border"
          cardStyle={{ marginTop: 15, marginBottom: 15, padding: "12px 38px 20px 38px" }}
        >
          <div
            className="mx-auto mt-5 flex w-full flex-col items-stretch"
            style={{ maxWidth: GAME_CARD_MAX_WIDTH_PX, gap: 20 }}
          >
            {/* Game title - moved to top */}
            <div className="w-full text-base font-semibold text-[var(--text-primary)]">
              {GAME_TABS[selectedGame]?.label ?? "PUBG Mobile"}
            </div>

            {/* Game selector */}
            <div
              className="mr-px flex w-full items-center justify-center gap-[50px] overflow-x-auto text-base"
              style={{
                scrollbarWidth: "none",
                margin: "16px 16px 0 0",
                padding: "10px 50px",
              }}
            >
              {GAME_TABS.map((game, idx) => (
                <button
                  key={game.icon}
                  type="button"
                  onClick={() => setSelectedGame(idx)}
                  className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border px-4 py-2.5 transition-all"
                  style={{
                    background: "#141414",
                    borderColor: selectedGame === idx ? "var(--primary)" : "#292929",
                    boxShadow:
                      selectedGame === idx
                        ? "0 44px 12px 0 rgba(3,255,147,0), 0 28px 11px 0 rgba(3,255,147,0.01), 0 16px 10px 0 rgba(3,255,147,0.05), 0 7px 7px 0 rgba(3,255,147,0.09), 0 2px 4px 0 rgba(3,255,147,0.10)"
                        : "none",
                  }}
                >
                  <span className="flex h-8 w-11 items-center justify-center rounded bg-white/[0.06] p-0.5">
                    {/* <img> — shaffof PNG + Next Image optimizatsiyasi ba'zi logolarda yuklanmasligi uchun */}
                    <img
                      src={game.icon}
                      alt={game.label}
                      width={44}
                      height={32}
                      className="h-8 w-11 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </button>
              ))}
            </div>

            {/* Game fields — shu sahifada input; "Saqlash" barcha o‘yin maydonlarini yuboradi */}
            <div className="w-full">
              {selectedGame === 0 && (
                <div className="my-[10px] space-y-1">
                  <GameTextField
                    label="Nickname"
                    value={formData.playName}
                    onChange={(v) => setFormData({ ...formData, playName: v })}
                    placeholder="Nickname kiriting"
                  />
                  <GameTextField
                    label="UID"
                    value={formData.gameID}
                    onChange={(v) => setFormData({ ...formData, gameID: v })}
                    placeholder="UID ni kiriting"
                  />
                </div>
              )}
              {selectedGame === 1 && (
                <div className="my-[10px] space-y-1">
                  <GameTextField
                    label="Nickname"
                    value={formData.mobileLegendsName}
                    onChange={(v) => setFormData({ ...formData, mobileLegendsName: v })}
                    placeholder="Nickname kiriting"
                  />
                  <GameTextField
                    label="UID"
                    value={formData.mobileLegendsUID}
                    onChange={(v) => setFormData({ ...formData, mobileLegendsUID: v })}
                    placeholder="UID ni kiriting"
                  />
                </div>
              )}
              {selectedGame === 2 && (
                <div className="my-[10px] space-y-1">
                  <GameTextField
                    label="Nickname"
                    value={formData.freeFireName}
                    onChange={(v) => setFormData({ ...formData, freeFireName: v })}
                    placeholder="Nickname kiriting"
                  />
                  <GameTextField
                    label="UID"
                    value={formData.freeFireUID}
                    onChange={(v) => setFormData({ ...formData, freeFireUID: v })}
                    placeholder="UID ni kiriting"
                  />
                </div>
              )}
              {selectedGame === 3 && (
                <div className="my-[10px] space-y-1">
                  <GameTextField
                    label="Nickname"
                    value={formData.steamName}
                    onChange={(v) => setFormData({ ...formData, steamName: v })}
                    placeholder="Nickname kiriting"
                  />
                </div>
              )}
            </div>

            <div className="w-full">
              <SwitchRow
                variant="game"
                label="Ma'lumotlarni yashirish"
                description="Reytingda ma'lumotlaringizni ko'rinmasligini ta'minlaymiz"
                checked={formData.hideGameInfo}
                onChange={(val) => setFormData({ ...formData, hideGameInfo: val })}
              />
            </div>
          </div>
        </Section>
        </div>

        {/* Social Networks */}
        <div style={{ marginTop: SECTION_TO_SECTION_GAP_PX }}>
        <Section
          title="IJTIMOIY TARMOQLAR"
          cardStyle={{ marginTop: 15, marginBottom: 15, padding: "20px 12px" }}
        >
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-5">
            <SocialIconLink icon="telegram" href="/profile/edit/telegramUrl" active={Boolean(formData.telegramUrl)} />
            <SocialIconLink icon="instagram" href="/profile/edit/instagramUrl" active={Boolean(formData.instagramUrl)} />
            <SocialIconLink icon="youtube" href="/profile/edit/youtubeUrl" active={Boolean(formData.youtubeUrl)} />
            <SocialIconLink icon="tiktok" href="/profile/edit/tiktokUrl" active={Boolean(formData.tiktokUrl)} />
            <SocialIconLink icon="facebook" href="/profile/edit/facebookUrl" active={Boolean(formData.facebookUrl)} />
            <SocialIconLink icon="discord" href="/profile/edit/discordUrl" active={Boolean(formData.discordUrl)} />
            <SocialIconLink icon="linkedin" href="/profile/edit/linkedinUrl" active={Boolean(formData.linkedinUrl)} />
            <SocialIconLink icon="twitter" href="/profile/edit/twitterUrl" active={Boolean(formData.twitterUrl)} />
            <SocialIconLink icon="donation-alerts" href="/profile/edit/donationAlertsUrl" active={Boolean(formData.donationAlertsUrl)} />
            <SocialIconLink icon="internet" href="/profile/edit/websiteUrl" active={Boolean(formData.websiteUrl)} />
          </div>
        </Section>
        </div>

        {saveError && (
          <p
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            style={{ marginTop: 12 }}
            role="alert"
          >
            {saveError}
          </p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-5 rounded-2xl bg-[var(--primary)] text-base font-bold text-black disabled:opacity-70"
          style={{ padding: 8, marginTop: 20, marginBottom: 20, marginLeft: 0, marginRight: 0 }}
        >
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
              </div>
            </div>
      </div>

      {/* Gender center modal */}
      {showGenderSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowGenderSheet(false)}>
          <div className="absolute inset-0 overflow-hidden" style={{ background: "rgba(0,0,0,0.6)" }} />
          <div
            className="relative w-full max-w-[420px] rounded-2xl border px-[15px] pt-[25px] pb-[25px] shadow-2xl"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}
            onClick={(e) => e.stopPropagation()}>
            <div
              className="mx-auto my-[10px] h-1 w-10 rounded-full"
              style={{
                background: "rgba(46, 45, 45, 1)",
                paddingLeft: 20,
                paddingRight: 20,
                marginLeft: 190,
                marginRight: 190,
              }}
            />
            <p className="my-[10px] pt-[10px] pb-[10px] text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Jinsni tanlang
            </p>
            {["Erkak", "Ayol", "Ko'rsatmaslikni afzal ko'raman"].map((gender, idx) => (
              <button
                key={gender}
                onClick={() => {
                  setFormData({ ...formData, gender });
                  setShowGenderSheet(false);
                }}
                className={`flex w-full items-center justify-center rounded-xl py-[5px] text-left ${idx > 0 ? "my-[10px]" : ""}`}
                style={{ background: formData.gender === gender ? "rgba(143, 188, 169, 1)" : "var(--bg-card2)" }}
              >
                <span
                  className="font-medium"
                  style={{
                    color: formData.gender === gender ? "#000" : "var(--text-primary)",
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 5,
                    marginRight: 5,
                    paddingLeft: 78,
                    paddingRight: 78,
                  }}
                >
                  {gender}
                </span>
                {formData.gender === gender && (
                  <Check size={20} style={{ marginTop: 5, marginBottom: 5, marginLeft: 10, marginRight: 10, color: "rgba(243, 237, 237, 1)" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SwitchRow({
  label,
  description,
  checked,
  onChange,
  variant = "default",
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  variant?: "default" | "account" | "game";
}) {
  const isGame = variant === "game";
  const isAccount = variant === "account";

  return (
    <div
      className={`flex items-start justify-between gap-4 border-t ${isGame ? "mt-0 mb-0 mx-[10px]" : ""} ${isAccount ? "mt-2.5 mb-2.5" : ""}`}
      style={{
        borderColor: "var(--border)",
        paddingTop: isAccount ? 10 : 16,
        ...(isAccount ? { paddingBottom: 10 } : {}),
      }}
    >
      <div className="flex-1" style={{ margin: isAccount ? 10 : undefined }}>
        <p
          className={`text-sm font-semibold ${isGame ? "my-2.5 pt-[10px] pb-[10px]" : "mb-4"}`}
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </p>
        <p
          className="text-xs leading-relaxed"
          style={{ color: "var(--text-muted)", marginTop: isGame ? 0 : undefined, marginBottom: isGame ? 0 : undefined }}
        >
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 rounded-full transition-colors ${
          isGame ? "my-[10px] ml-0 min-h-7 w-12 py-2.5" : "h-7 w-12"
        }`}
        style={{
          background: checked ? "#00CC75" : "#4B5563",
          ...(isAccount ? { color: "var(--color-green-900)", margin: 10 } : {}),
        }}
      >
        <div
          className="absolute top-1 h-5 w-5 rounded-full bg-white transition-all"
          style={{
            left: checked ? "25px" : "3px"
          }}
        />
      </button>
    </div>
  );
}

function EditableNavRow({ label, value, href }: { label: string; value: string; href: string }) {
  const display = value || "Kiritilmagan";
  const isPlaceholder = !value;
  return (
    <Link href={href} className="flex min-h-[56px] items-center justify-between border-b py-3" style={{ borderColor: "var(--border)" }}>
      <span className="text-sm text-[var(--text-secondary)] md:text-base">{label}</span>
      <div className="flex items-center gap-3">
        <span
          className={`max-w-[220px] truncate text-sm font-semibold text-[var(--text-primary)] md:text-base ${
            isPlaceholder ? "text-white/50" : ""
          }`}
        >
          {display}
        </span>
        <ChevronRight size={18} className="text-[var(--text-secondary)]" />
      </div>
    </Link>
  );
}

function SocialIconLink({ icon, href, active }: { icon: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-card2)] transition-opacity"
      aria-label={icon}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
        style={{ background: active ? "var(--primary)" : "var(--bg-card2)" }}
      >
        <Image
          src={`/icons/${icon}.svg`}
          alt=""
          width={20}
          height={20}
          className={
            active
              ? "object-contain brightness-0 invert"
              : "object-contain grayscale opacity-[0.45]"
          }
        />
      </div>
    </Link>
  );
}

function GameTextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 50,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="mb-1">
      <label className="mb-1.5 block text-sm" style={{ color: "var(--text-secondary)", padding: 5 }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className="box-border min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card2)] text-base outline-none placeholder:text-[var(--text-muted)]"
        style={{ color: "var(--text-primary)", paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}
        autoComplete="off"
      />
    </div>
  );
}
