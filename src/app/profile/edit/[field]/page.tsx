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
    <div className="w-full mx-auto pb-10" style={{ maxWidth: '900px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <div
        className="rounded-3xl overflow-hidden"
        style={{ background: "var(--bg-card)", marginTop: 5, marginBottom: 16, padding: "1.5rem" }}
      >
        <div className="relative mb-8 flex h-11 items-center justify-center">
          <button
            onClick={() => router.push("/profile/edit")}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-xl bg-transparent"
          >
            <ChevronLeft size={20} />
          </button>
          <h1
            className="text-[30px] font-semibold leading-none"
            style={{ marginLeft: 0, marginRight: 0, paddingTop: 5, paddingBottom: 5, paddingLeft: 5, paddingRight: 5 }}
          >
            {config.label}
          </h1>
        </div>

        <div
          className={`w-full ${field === "birthDate" ? "rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4" : ""}`}
        >
          <label
            className={`mb-2 block text-sm text-[var(--text-secondary)] ${field === "birthDate" ? "text-center" : ""}`}
            style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 5, paddingRight: 5 }}
          >
            {config.label}
          </label>
          {field === "birthDate" ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={openBirthDatePicker}
                className="relative my-[10px] flex h-12 w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-card2)] px-3.5"
                style={{ marginLeft: 0, marginRight: 0, paddingTop: 10, paddingBottom: 10, paddingLeft: 5, paddingRight: 5 }}
              >
                <span
                  className={`block w-full px-7 text-center text-sm ${
                    birthDatePreview ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                  }`}
                  style={{ marginTop: 0, marginBottom: 0, paddingTop: 3, paddingBottom: 3 }}
                >
                  {birthDatePreview || "Tug'ilgan sanangizni kiriting"}
                </span>
                <ChevronRight
                  size={18}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 text-[var(--text-muted)]"
                  aria-hidden
                />
              </button>
              <p className="text-xs leading-5 text-amber-600" style={{ paddingTop: 10, paddingBottom: 10, marginLeft: 5, marginRight: 5 }}>
                Ushbu ma’lumotni siz faqatgina bir marotaba o‘zgartira olasiz, ma’lumotni kiritayotganingizda e’tiborli
                bo‘ling. Sizning tug‘ilgan sanangiz ommaga ko‘rsatilmaydi.
              </p>
              <div className="border-t border-[var(--border)] pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-sm font-medium text-[var(--text-primary)]"
                      style={{ marginTop: 5, marginBottom: 5, marginLeft: 5, marginRight: 5 }}
                    >
                      Tug‘ilgan kun haqida habar berish
                    </p>
                    <p
                      className="mt-0 max-w-[260px] text-xs leading-5 text-[var(--text-muted)]"
                      style={{ marginTop: 0, marginBottom: 0, marginLeft: 5, marginRight: 5, paddingTop: 5, paddingBottom: 5 }}
                    >
                      Tug‘ilgan kuningizda biz kanalingizda maxsus chat fonini ko‘rsatamiz, shunda Quvna foydalanuvchilari
                      ushbu muhim kun haqida bilishadi.
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Tug‘ilgan kun xabari"
                    onClick={() => setBirthdayNoticeEnabled((v) => !v)}
                    className={`relative mt-1 h-7 w-12 rounded-full transition-colors ${
                      birthdayNoticeEnabled ? "bg-emerald-500" : "bg-zinc-600"
                    }`}
                    style={{ marginTop: 10, marginBottom: 10, marginLeft: 5, marginRight: 5 }}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                        birthdayNoticeEnabled ? "left-[24px]" : "left-[2px]"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : config.multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={config.maxLength}
              placeholder={config.placeholder}
              className="min-h-[220px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card2)] text-base outline-none placeholder:text-[var(--text-muted)]"
              style={{
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 10,
                paddingRight: 10,
                paddingTop: 5,
                paddingBottom: 5,
              }}
            />
          ) : (
            <div className="relative mt-3">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={config.maxLength}
                placeholder={config.placeholder}
                className="h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-card2)] pr-16 text-base outline-none placeholder:text-[var(--text-muted)]"
                style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 5, paddingBottom: 5, marginTop: 0, marginBottom: 0 }}
              />
              {!!config.maxLength && (
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">
                  {chars}/{config.maxLength}
                </span>
              )}
            </div>
          )}
          {!!changeLimitHint && (
            <p
              className="mt-3 text-sm text-[var(--text-muted)]"
              style={{ paddingTop: 0, paddingBottom: 0, marginTop: 2, marginBottom: 2 }}
            >
              {changeLimitHint}
            </p>
          )}
          {!!visibilityHint && (
            <p className="mt-2 text-sm text-[var(--text-muted)]" style={{ paddingTop: 0, paddingBottom: 0 }}>
              {visibilityHint}
            </p>
          )}
          {config.note && <p className="mt-3 text-xs text-[var(--text-muted)]">{config.note}</p>}
        </div>

        {saveError && (
          <p
            className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {saveError}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-auto w-full rounded-2xl bg-[var(--primary)] py-3 text-base font-semibold text-black disabled:opacity-70"
          style={{ paddingTop: 5, paddingBottom: 5, marginTop: 10, marginBottom: 10 }}
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>

    {field === "birthDate" && showBirthDatePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowBirthDatePicker(false)}
            aria-label="Yopish"
          />
          <div
            className={cn(
              "relative z-10 flex w-full max-w-sm flex-col",
              "aspect-square min-h-0",
              "rounded-md border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-lg",
              "lg:translate-x-[110px]"
            )}
          >
            <div className="mb-2 flex min-h-8 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-[5px] pb-2">
              <button
                type="button"
                className="shrink-0 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                onClick={() => setShowBirthDatePicker(false)}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                className="shrink-0 text-sm font-semibold text-[var(--primary)]"
                onClick={applyBirthDatePicker}
              >
                Tayyor
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center">
              <div className="grid w-full grid-cols-3 gap-2">
              <select
                value={pickerMonth}
                onChange={(e) => setPickerMonth(e.target.value)}
                className={cn(
                  "h-9 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--bg-card2)] px-2",
                  "text-sm text-[var(--text-primary)] outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
                )}
              >
                {MONTHS.map((month, i) => (
                  <option key={month} value={String(i + 1)}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={pickerDay}
                onChange={(e) => setPickerDay(e.target.value)}
                className={cn(
                  "h-9 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--bg-card2)] px-2",
                  "text-sm text-[var(--text-primary)] outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
                )}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={String(d)}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                value={pickerYear}
                onChange={(e) => setPickerYear(e.target.value)}
                className={cn(
                  "h-9 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--bg-card2)] px-2",
                  "text-sm text-[var(--text-primary)] outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25"
                )}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
