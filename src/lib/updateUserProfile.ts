import axios from "axios";
import { api } from "./api";

/** Backend DTO da yuboriladigan maydonlar (GET dagi attachmentResponseDTO, rating va h.k. yuborilmaydi). */
const PROFILE_UPDATE_KEYS = [
  "firstName",
  "lastName",
  "username",
  "bio",
  "gender",
  "country",
  "birthDate",
  "isPrivate",
  "playName",
  "gameID",
  "freeFireName",
  "freeFireUID",
  "mobileLegendsName",
  "mobileLegendsUID",
  "steamName",
  "hideGameInfo",
  "telegramUrl",
  "instagramUrl",
  "youtubeUrl",
  "tiktokUrl",
  "facebookUrl",
  "discordUrl",
  "linkedinUrl",
  "twitterUrl",
  "donationAlertsUrl",
  "websiteUrl",
] as const;

export function pickProfileUpdatePayload(merged: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of PROFILE_UPDATE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(merged, key)) {
      const v = merged[key];
      if (v !== undefined) {
        out[key] = v;
      }
    }
  }
  return out;
}

export function formatApiError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data as { message?: string; error?: string; data?: { message?: string } } | string;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const m = d.message ?? d.error ?? d.data?.message;
      if (typeof m === "string" && m.trim()) return m;
    }
    const s = e.response?.status;
    if (s === 401) return "Avtorizatsiya muddati tugagan — qayta kiring.";
    if (s === 403) return "Ruxsat berilmadi.";
    if (s === 405) return "Server ushbu so‘rov usulini qo‘llab-quvvatlamaydi.";
    if (s) return `Server xatosi (${s})`;
    return e.message || "Tarmoq xatosi";
  }
  if (e instanceof Error) return e.message;
  return "Noma’lum xato";
}

const PROFILE_UPDATE_PATH = (userId: number) => `/user/profile/${userId}` as const;

/**
 * Profilni yangilash. Faqat ruxsat etilgan maydonlar yuboriladi (ichki obyektlar emas).
 * 405 (Method Not Allowed) bo‘lsa keyingi usul sinanadi: PATCH → PUT → POST.
 * Spring REST da ba’zi endpoint’lar faqat bitta usulni (masalan, POST) qo‘llab-quvvatlaydi.
 */
export async function updateUserProfile(userId: number, raw: object) {
  const merged = raw as Record<string, unknown>;
  const payload = pickProfileUpdatePayload(merged);
  if (Object.keys(payload).length === 0) {
    throw new Error("Yuboriladigan maydonlar bo‘sh");
  }
  const path = PROFILE_UPDATE_PATH(userId);
  const attempts = [
    () => api.patch(path, payload),
    () => api.put(path, payload),
    () => api.post(path, payload),
  ] as const;

  let lastErr: unknown;
  for (const doReq of attempts) {
    try {
      const res = await doReq();
      return res.data;
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 405) {
        lastErr = e;
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}
