"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "@/hooks/useProfile";
import { formatApiError, updateUserProfile } from "@/lib/updateUserProfile";
import { cn } from "@/lib/utils";

type FieldConfig = {
  label: string;
  placeholder: string;
  multiline?: boolean;
  maxLength?: number;
  note?: string;
};

const FIELD_CONFIG: Record<string, FieldConfig> = {
  firstName: { label: "Ism", placeholder: "To'liq ismingizni kiriting", maxLength: 50 },
  lastName: { label: "Familiya", placeholder: "Familiyangizni kiriting", maxLength: 50 },
  username: { label: "Tahallus", placeholder: "Tahallusingizni kiriting", maxLength: 50 },
  birthDate: { label: "Tug'ilgan sana", placeholder: "DD/MM/YYYY", maxLength: 20 },
  country: { label: "Davlat", placeholder: "Davlatni kiriting", maxLength: 60 },
  bio: { label: "O'zim haqimda", placeholder: "O'zingiz haqida yozing", multiline: true, maxLength: 2000 },
  playName: { label: "PUBG Nickname", placeholder: "Nickname kiriting", maxLength: 50 },
  gameID: { label: "PUBG UID", placeholder: "UID ni kiriting", maxLength: 50 },
  freeFireName: { label: "Free Fire Nickname", placeholder: "Nickname kiriting", maxLength: 50 },
  freeFireUID: { label: "Free Fire UID", placeholder: "UID ni kiriting", maxLength: 50 },
  mobileLegendsName: { label: "Mobile Legends Nickname", placeholder: "Nickname kiriting", maxLength: 50 },
  mobileLegendsUID: { label: "Mobile Legends UID", placeholder: "UID ni kiriting", maxLength: 50 },
  steamName: { label: "Steam Nickname", placeholder: "Nickname kiriting", maxLength: 50 },
  telegramUrl: { label: "Telegram", placeholder: "Telegram havolasini kiriting", maxLength: 255 },
  instagramUrl: { label: "Instagram", placeholder: "Instagram havolasini kiriting", maxLength: 255 },
  youtubeUrl: { label: "YouTube", placeholder: "YouTube havolasini kiriting", maxLength: 255 },
  tiktokUrl: { label: "TikTok", placeholder: "TikTok havolasini kiriting", maxLength: 255 },
  facebookUrl: { label: "Facebook", placeholder: "Facebook havolasini kiriting", maxLength: 255 },
  discordUrl: { label: "Discord", placeholder: "Discord profil havolasi", maxLength: 255 },
  linkedinUrl: { label: "LinkedIn", placeholder: "LinkedIn havolasi", maxLength: 255 },
  twitterUrl: { label: "X (Twitter)", placeholder: "X yoki Twitter havolasi", maxLength: 255 },
  donationAlertsUrl: { label: "Donation Alerts", placeholder: "Donation Alerts havolasi", maxLength: 255 },
  websiteUrl: { label: "Veb-sayt", placeholder: "https://...", maxLength: 255 },
};

const MONTHS = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
] as const;

/** YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY lardan { kun, oy, yil } */
function parseBirthToParts(raw: string) {
  const s = String(raw).trim();
  if (!s) return { d: "", m: "", y: "" };
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { d: iso[3], m: iso[2], y: iso[1] };
  const dmy = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (dmy) return { d: dmy[1], m: dmy[2], y: dmy[3] };
  return { d: "", m: "", y: "" };
}

/** Toʻliq bo'lsa `DD/MM/YYYY`, bo'sh qator */
function composeBirthDate(d: string, m: string, y: string) {
  const dT = d.trim();
  const mT = m.trim();
  const yT = y.trim();
  if (!dT && !mT && !yT) return "";
  if (dT && mT && yT.length === 4) {
    return `${dT.padStart(2, "0")}/${mT.padStart(2, "0")}/${yT}`;
  }
  return "";
}

export default function EditFieldPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ field: string }>();
  const field = params?.field ?? "";
  const config = FIELD_CONFIG[field];

  const { user } = useAuthStore();
  const userId = user?.id ? Number(user.id) : null;
  const { data: profile } = useProfile(userId);

  const [value, setValue] = useState("");
  const [bdDay, setBdDay] = useState("");
  const [bdMonth, setBdMonth] = useState("");
  const [bdYear, setBdYear] = useState("");
  const [pickerDay, setPickerDay] = useState("1");
  const [pickerMonth, setPickerMonth] = useState("1");
  /** Set in open/profile sync; default avoids any SSR/client time skew for year. */
  const [pickerYear, setPickerYear] = useState("2000");
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [birthdayNoticeEnabled, setBirthdayNoticeEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (profile && config) {
      if (field === "birthDate") {
        const p = profile as Record<string, unknown>;
        const raw = String(p.birthDate ?? p.age ?? "");
        const { d, m, y } = parseBirthToParts(raw);
        setBdDay(d);
        setBdMonth(m);
        setBdYear(y);
        setValue(composeBirthDate(d, m, y));
        setPickerDay(String(parseInt(d || "1", 10) || 1));
        setPickerMonth(String(parseInt(m || "1", 10) || 1));
        setPickerYear(String(parseInt(y || String(new Date().getFullYear()), 10) || new Date().getFullYear()));
      } else {
        setValue(String(profile[field] ?? ""));
      }
    }
  }, [profile, field, config]);

  const chars = useMemo(() => value.length, [value]);
  const birthDatePreview = useMemo(() => {
    const d = parseInt(bdDay || "0", 10);
    const m = parseInt(bdMonth || "0", 10);
    const y = parseInt(bdYear || "0", 10);
    if (!d || !m || !y) return "";
    return `${d} ${MONTHS[m - 1]}, ${y}`;
  }, [bdDay, bdMonth, bdYear]);
  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const years: string[] = [];
    for (let y = now; y >= 1940; y -= 1) years.push(String(y));
    return years;
  }, []);
  const visibilityHint =
    field === "firstName"
      ? "Ushbu ism barcha foydalanuvchilarga ko'rinadi."
      : field === "username"
        ? "Ushbu tahallus barcha foydalanuvchilarga ko'rinadi."
        : "";
  const changeLimitHint =
    field === "firstName"
      ? "Ismni almashtirish funksiyasi har 30 kunda bir marta mavjud bo'ladi"
      : field === "username"
        ? "Ismni almashtirish funksiyasi har 60 kunda bir marta mavjud bo'ladi"
        : "";

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <button onClick={() => router.push("/profile/edit")} className="rounded-xl bg-[var(--bg-card)] px-4 py-2">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div
        className="w-full mx-auto min-h-[50vh] pb-10"
        style={{
          maxWidth: 900,
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "1rem",
          paddingRight: "1rem",
        }}
        suppressHydrationWarning
      />
    );
  }

  const handleSave = async () => {
    if (!userId || !profile) return;
    if (field === "birthDate") {
      const c = composeBirthDate(bdDay, bdMonth, bdYear);
      if (c) {
        const d = parseInt(bdDay, 10);
        const mo = parseInt(bdMonth, 10);
        const y = parseInt(bdYear, 10);
        if (d < 1 || d > 31 || mo < 1 || mo > 12 || y < 1940 || y > new Date().getFullYear()) {
          setSaveError("Kun 1–31, oy 1–12 orasida bo‘lsin.");
          return;
        }
      }
    }
    setSaveError(null);
    setSaving(true);
    const toSend = field === "birthDate" ? composeBirthDate(bdDay, bdMonth, bdYear) : value;
    try {
      await updateUserProfile(userId, { ...profile, [field]: toSend });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      router.push("/profile/edit");
    } catch (e) {
      setSaveError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const openBirthDatePicker = () => {
    setPickerDay(String(parseInt(bdDay || "1", 10) || 1));
    setPickerMonth(String(parseInt(bdMonth || "1", 10) || 1));
    setPickerYear(String(parseInt(bdYear || String(new Date().getFullYear()), 10) || new Date().getFullYear()));
    setShowBirthDatePicker(true);
  };

  const applyBirthDatePicker = () => {
    setBdDay(String(parseInt(pickerDay, 10)).padStart(2, "0"));
    setBdMonth(String(parseInt(pickerMonth, 10)).padStart(2, "0"));
    setBdYear(pickerYear);
    setValue(composeBirthDate(String(parseInt(pickerDay, 10)), String(parseInt(pickerMonth, 10)), pickerYear));
    setShowBirthDatePicker(false);
  };

  return (
    <>
      {/* Page */}
      <div style={{ minHeight: "100dvh", width: "100%", background: "#050505", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ width: "100%", maxWidth: 560, background: "#141416", border: "1px solid rgba(63,63,70,0.8)", borderRadius: 28, boxShadow: "0 25px 50px rgba(0,0,0,0.5)", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div style={{ height: 72, paddingLeft: 24, paddingRight: 24, display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(63,63,70,0.7)", flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => router.push("/profile/edit")}
              aria-label="Orqaga"
              style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#27272a")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{config.label}</h1>
          </div>

          {/* Content */}
          <div style={{ padding: "24px 24px 8px", display: "flex", flexDirection: "column", gap: 12 }}>

            {field === "birthDate" ? (
              <>
                <button
                  type="button"
                  onClick={openBirthDatePicker}
                  style={{ width: "100%", height: 58, borderRadius: 16, border: "1px solid #3f3f46", background: "#1c1c1f", color: birthDatePreview ? "#fff" : "#71717a", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 20, paddingRight: 20, boxSizing: "border-box", cursor: "pointer" }}
                >
                  <span>{birthDatePreview || "Tug’ilgan sanangizni kiriting"}</span>
                  <ChevronRight size={18} color="#71717a" />
                </button>

                <p style={{ fontSize: 12, lineHeight: 1.6, color: "#d97706", margin: 0 }}>
                  Ushbu ma&apos;lumotni siz faqatgina bir marotaba o&apos;zgartira olasiz. Sizning tug&apos;ilgan sanangiz ommaga ko&apos;rsatilmaydi.
                </p>

                <div style={{ borderTop: "1px solid rgba(63,63,70,0.5)", paddingTop: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#fff", margin: "0 0 4px" }}>Tug&apos;ilgan kun haqida habar berish</p>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: "#71717a", margin: 0, maxWidth: 260 }}>
                      Tug&apos;ilgan kuningizda maxsus chat foni ko&apos;rsatiladi.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Tug’ilgan kun xabari"
                    onClick={() => setBirthdayNoticeEnabled((v) => !v)}
                    style={{ position: "relative", width: 48, height: 28, borderRadius: 999, border: "none", background: birthdayNoticeEnabled ? "#10b981" : "#4b5563", cursor: "pointer", flexShrink: 0, marginTop: 2 }}
                  >
                    <span style={{ position: "absolute", top: 3, left: birthdayNoticeEnabled ? 23 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </button>
                </div>
              </>
            ) : config.multiline ? (
              <>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={config.maxLength}
                  placeholder={config.placeholder}
                  style={{ width: "100%", minHeight: 160, borderRadius: 16, border: "1px solid #3f3f46", background: "#1c1c1f", color: "#fff", fontSize: 16, padding: "12px 16px", boxSizing: "border-box", outline: "none", resize: "none" }}
                />
                {!!config.maxLength && (
                  <p style={{ textAlign: "right", fontSize: 12, color: "#71717a", margin: 0 }}>{chars}/{config.maxLength}</p>
                )}
              </>
            ) : (
              <div style={{ position: "relative" }}>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={config.maxLength}
                  placeholder={config.placeholder}
                  style={{ width: "100%", height: 58, borderRadius: 16, border: "1px solid #3f3f46", background: "#1c1c1f", color: "#fff", fontSize: 16, paddingLeft: 16, paddingRight: config.maxLength ? 60 : 16, boxSizing: "border-box", outline: "none" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.6)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#3f3f46")}
                />
                {!!config.maxLength && (
                  <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#71717a", pointerEvents: "none" }}>
                    {chars}/{config.maxLength}
                  </span>
                )}
              </div>
            )}

            {!!changeLimitHint && <p style={{ fontSize: 12, color: "#71717a", margin: 0 }}>{changeLimitHint}</p>}
            {!!visibilityHint && <p style={{ fontSize: 12, color: "#71717a", margin: 0 }}>{visibilityHint}</p>}
            {config.note && <p style={{ fontSize: 12, color: "#71717a", margin: 0 }}>{config.note}</p>}

            {saveError && (
              <p style={{ fontSize: 13, color: "#fca5a5", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: "8px 12px", margin: 0 }} role="alert">
                {saveError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 24px 24px", boxSizing: "border-box" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ width: "100%", height: 52, borderRadius: 16, border: "none", background: saving ? "#27272a" : "#10b981", color: saving ? "#71717a" : "#000", fontSize: 16, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", boxSizing: "border-box" }}
            >
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </div>
        </div>
      </div>

      {/* BirthDate Picker Modal */}
      {field === "birthDate" && showBirthDatePicker && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)" }}
          role="dialog"
          aria-modal="true"
        >
          <button
            style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer" }}
            onClick={() => setShowBirthDatePicker(false)}
            aria-label="Yopish"
          />
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380, background: "#141416", border: "1px solid rgba(63,63,70,0.8)", borderRadius: 24, boxShadow: "0 25px 50px rgba(0,0,0,0.5)", overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(63,63,70,0.5)" }}>
              <button type="button" onClick={() => setShowBirthDatePicker(false)} style={{ fontSize: 14, color: "#a1a1aa", background: "none", border: "none", cursor: "pointer" }}>
                Bekor qilish
              </button>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Sana tanlang</p>
              <button type="button" onClick={applyBirthDatePicker} style={{ fontSize: 14, fontWeight: 600, color: "#10b981", background: "none", border: "none", cursor: "pointer" }}>
                Tayyor
              </button>
            </div>

            {/* Selects */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "20px 24px 24px", boxSizing: "border-box" }}>
              {([
                { value: pickerMonth, onChange: setPickerMonth, options: MONTHS.map((m, i) => ({ value: String(i + 1), label: m })) },
                { value: pickerDay, onChange: setPickerDay, options: Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })) },
                { value: pickerYear, onChange: setPickerYear, options: yearOptions.map(y => ({ value: y, label: y })) },
              ] as const).map((sel, idx) => (
                <select
                  key={idx}
                  value={sel.value}
                  onChange={(e) => (sel.onChange as (v: string) => void)(e.target.value)}
                  style={{ width: "100%", height: 44, borderRadius: 12, border: "1px solid #3f3f46", background: "#1c1c1f", color: "#fff", fontSize: 14, paddingLeft: 8, boxSizing: "border-box", outline: "none" }}
                >
                  {sel.options.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: "#141416" }}>{opt.label}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
