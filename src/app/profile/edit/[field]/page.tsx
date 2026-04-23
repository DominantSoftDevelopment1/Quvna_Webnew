"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "@/hooks/useProfile";
import { formatApiError, updateUserProfile } from "@/lib/updateUserProfile";

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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && config) {
      setValue(String(profile[field] ?? ""));
    }
  }, [profile, field, config]);

  const chars = useMemo(() => value.length, [value]);

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <button onClick={() => router.push("/profile/edit")} className="rounded-xl bg-[var(--bg-card)] px-4 py-2">
          Orqaga qaytish
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!userId || !profile) return;
    setSaveError(null);
    setSaving(true);
    try {
      await updateUserProfile(userId, { ...profile, [field]: value });
      await queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      router.push("/profile/edit");
    } catch (e) {
      setSaveError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[680px] flex-col px-4 pb-6 pt-6 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => router.push("/profile/edit")}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-card)]"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">{config.label}</h1>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <label className="mb-2 block text-sm text-[var(--text-secondary)]">{config.label}</label>
          {config.multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={config.maxLength}
              placeholder={config.placeholder}
              className="min-h-[220px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card2)] px-4 py-3 text-base outline-none placeholder:text-[var(--text-muted)]"
            />
          ) : (
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={config.maxLength}
              placeholder={config.placeholder}
              className="h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-card2)] px-4 text-base outline-none placeholder:text-[var(--text-muted)]"
            />
          )}
          {!!config.maxLength && (
            <p className="mt-2 text-right text-xs text-[var(--text-muted)]">
              {chars}/{config.maxLength}
            </p>
          )}
          {config.note && <p className="mt-3 text-xs text-[var(--text-muted)]">{config.note}</p>}
        </div>

        {saveError && (
          <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
            {saveError}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-auto rounded-xl bg-[var(--primary)] py-3 text-base font-semibold text-black disabled:opacity-70"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
