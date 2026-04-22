"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile, useEditProfile } from "@/hooks/useProfile";
import { cdnUrl } from "@/lib/utils";
import { ChevronLeft, Camera, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { EditableField } from "@/components/profile/EditableField";

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
    steamName: "",
    hideGameInfo: false,
    // Social
    telegramUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    facebookUrl: "",
  });

  const [selectedGame, setSelectedGame] = useState(0);
  const [showGenderSheet, setShowGenderSheet] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        username: profile.username || "",
        bio: profile.bio || "",
        gender: profile.gender || "",
        country: profile.country || "",
        birthDate: profile.birthDate || "",
        isPrivate: profile.isPrivate || false,
        playName: profile.playName || "",
        gameID: profile.gameID || "",
        freeFireName: profile.freeFireName || "",
        freeFireUID: profile.freeFireUID || "",
        mobileLegendsName: profile.mobileLegendsName || "",
        steamName: profile.steamName || "",
        hideGameInfo: profile.hideGameInfo || false,
        telegramUrl: profile.telegramUrl || "",
        instagramUrl: profile.instagramUrl || "",
        youtubeUrl: profile.youtubeUrl || "",
        tiktokUrl: profile.tiktokUrl || "",
        facebookUrl: profile.facebookUrl || "",
      });
    }
  }, [profile]);

  const handleSave = () => {
    if (!userId) return;
    editProfile({ userId, data: formData });
  };

  const avatarUrl = profile?.attachmentResponseDTO?.preSignedUrl ?? profile?.attachmentResponseDTO?.contentURL;
  const bannerUrl = profile?.userBannerAttachmentResponseDTO?.preSignedUrl ?? profile?.userBannerAttachmentResponseDTO?.contentURL;

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--bg-primary)" }}>
      {/* Header with banner */}
      <div className="relative" style={{ height: 200 }}>
        {bannerUrl ? (
          <img src={cdnUrl(bannerUrl)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #1a3a2f 0%, #0d1f17 100%)" }} />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)" }} />

        {/* Back button */}
        <button onClick={() => router.back()} className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
          <ChevronLeft size={20} style={{ color: "#fff" }} />
        </button>

        {/* Edit banner button */}
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
          <Camera size={18} style={{ color: "#fff" }} />
        </button>

        {/* Avatar */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -40 }}>
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden" style={{ border: "3px solid var(--bg-primary)" }}>
              {avatarUrl ? (
                <img src={cdnUrl(avatarUrl)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: "var(--bg-card2)", color: "var(--primary)" }}>
                  {formData.firstName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "var(--primary)", border: "2px solid var(--bg-primary)" }}>
              <Camera size={12} style={{ color: "#000" }} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-12 max-w-2xl mx-auto">
        {/* Main Info Section */}
        <Section title="ASOSIY MA'LUMOT">
          <EditableField
            label="Ism"
            value={formData.firstName}
            onChange={(val) => setFormData({ ...formData, firstName: val })}
            placeholder="Ismingizni kiriting"
          />
          <EditableField
            label="Familiya"
            value={formData.lastName}
            onChange={(val) => setFormData({ ...formData, lastName: val })}
            placeholder="Familiyangizni kiriting"
          />
          <EditableField
            label="Tahallus"
            value={formData.username}
            onChange={(val) => setFormData({ ...formData, username: val })}
            placeholder="@username"
          />
          <EditableField
            label="Tug'ilgan sana"
            value={formData.birthDate}
            onChange={(val) => setFormData({ ...formData, birthDate: val })}
            placeholder="DD.MM.YYYY"
          />
          <button
            onClick={() => setShowGenderSheet(true)}
            className="w-full flex items-center justify-between py-3 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Jins</span>
            <span className="text-sm font-medium" style={{ color: formData.gender ? "var(--text-primary)" : "var(--text-muted)" }}>
              {formData.gender || "Tanlang"}
            </span>
          </button>
          <EditableField
            label="Davlat"
            value={formData.country}
            onChange={(val) => setFormData({ ...formData, country: val })}
            placeholder="Davlatingizni kiriting"
          />
          <EditableField
            label="O'zim haqimda"
            value={formData.bio}
            onChange={(val) => setFormData({ ...formData, bio: val })}
            placeholder="Bio kiriting"
            multiline
          />

          <SwitchRow
            label="Yopiq hisob"
            description="Profilingizdagi ma'lumotlar boshqa foydalanuvchilarga ko'rinmaydi"
            checked={formData.isPrivate}
            onChange={(val) => setFormData({ ...formData, isPrivate: val })}
          />
        </Section>

        {/* Game Info Section */}
        <Section title="O'YIN MA'LUMOTLARI">
          {/* Game selector */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {["PUBG Mobile", "Free Fire", "Mobile Legends", "Steam"].map((game, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedGame(idx)}
                className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
                style={{
                  background: selectedGame === idx ? "var(--primary)" : "var(--bg-card2)",
                  color: selectedGame === idx ? "#000" : "var(--text-secondary)",
                }}
              >
                {game}
              </button>
            ))}
          </div>

          {/* Game fields */}
          {selectedGame === 0 && (
            <>
              <EditableField label="Nickname" value={formData.playName} onChange={(val) => setFormData({ ...formData, playName: val })} placeholder="Nickname kiriting" />
              <EditableField label="UID" value={formData.gameID} onChange={(val) => setFormData({ ...formData, gameID: val })} placeholder="UID ni kiriting" />
            </>
          )}
          {selectedGame === 1 && (
            <>
              <EditableField label="Nickname" value={formData.freeFireName} onChange={(val) => setFormData({ ...formData, freeFireName: val })} placeholder="Nickname kiriting" />
              <EditableField label="UID" value={formData.freeFireUID} onChange={(val) => setFormData({ ...formData, freeFireUID: val })} placeholder="UID ni kiriting" />
            </>
          )}
          {selectedGame === 2 && (
            <EditableField label="Nickname" value={formData.mobileLegendsName} onChange={(val) => setFormData({ ...formData, mobileLegendsName: val })} placeholder="Nickname kiriting" />
          )}
          {selectedGame === 3 && (
            <EditableField label="Nickname" value={formData.steamName} onChange={(val) => setFormData({ ...formData, steamName: val })} placeholder="Nickname kiriting" />
          )}

          <SwitchRow
            label="Ma'lumotlarni yashirish"
            description="Reytingda ma'lumotlaringizni ko'rinmasligini ta'minlaymiz"
            checked={formData.hideGameInfo}
            onChange={(val) => setFormData({ ...formData, hideGameInfo: val })}
          />
        </Section>

        {/* Social Networks */}
        <Section title="IJTIMOIY TARMOQLAR">
          <div className="space-y-3">
            <SocialInput
              icon="telegram"
              value={formData.telegramUrl}
              onChange={(val) => setFormData({ ...formData, telegramUrl: val })}
              placeholder="Telegram username"
            />
            <SocialInput
              icon="instagram"
              value={formData.instagramUrl}
              onChange={(val) => setFormData({ ...formData, instagramUrl: val })}
              placeholder="Instagram username"
            />
            <SocialInput
              icon="youtube"
              value={formData.youtubeUrl}
              onChange={(val) => setFormData({ ...formData, youtubeUrl: val })}
              placeholder="YouTube channel"
            />
            <SocialInput
              icon="tiktok"
              value={formData.tiktokUrl}
              onChange={(val) => setFormData({ ...formData, tiktokUrl: val })}
              placeholder="TikTok username"
            />
            <SocialInput
              icon="facebook"
              value={formData.facebookUrl}
              onChange={(val) => setFormData({ ...formData, facebookUrl: val })}
              placeholder="Facebook profile"
            />
          </div>
        </Section>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2 mt-6"
          style={{ background: "var(--primary)", color: "#000" }}
        >
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

      {/* Gender bottom sheet */}
      {showGenderSheet && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowGenderSheet(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />
          <div className="relative w-full rounded-t-3xl p-6 space-y-3" style={{ background: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--text-muted)" }} />
            {["Erkak", "Ayol", "Ko'rsatmaslikni afzal ko'raman"].map((gender) => (
              <button
                key={gender}
                onClick={() => {
                  setFormData({ ...formData, gender });
                  setShowGenderSheet(false);
                }}
                className="w-full p-4 rounded-2xl text-left flex items-center justify-between"
                style={{ background: formData.gender === gender ? "var(--primary)" : "var(--bg-card2)" }}
              >
                <span className="font-medium" style={{ color: formData.gender === gender ? "#000" : "var(--text-primary)" }}>
                  {gender}
                </span>
                {formData.gender === gender && <Check size={20} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold mb-3 px-1" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
        {title}
      </h2>
      <div className="rounded-2xl p-4 space-y-4" style={{ background: "var(--bg-card)" }}>
        {children}
      </div>
    </div>
  );
}


function SwitchRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="flex-1">
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{label}</p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-7 rounded-full transition-colors shrink-0"
        style={{ background: checked ? "var(--primary)" : "var(--bg-card2)" }}
      >
        <div
          className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all"
          style={{ left: checked ? "25px" : "3px" }}
        />
      </button>
    </div>
  );
}

function SocialInput({ icon, value, onChange, placeholder }: { icon: string; value: string; onChange: (val: string) => void; placeholder: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: value ? "var(--primary)" : "var(--bg-card2)" }}>
        <span className="text-lg">{icon === "telegram" ? "📱" : icon === "instagram" ? "📷" : icon === "youtube" ? "▶️" : icon === "tiktok" ? "🎵" : "👥"}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-xl text-sm"
        style={{ background: "var(--bg-card2)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
      />
    </div>
  );
}
