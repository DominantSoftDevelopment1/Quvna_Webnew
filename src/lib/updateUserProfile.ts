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
    const d = e.response?.data as
      | { message?: string; error?: string; path?: string; status?: number; data?: { message?: string } }
      | string;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const m = d.message ?? d.error ?? d.data?.message;
      if (typeof m === "string" && m.trim()) return m;
    }
    const s = e.response?.status;
    if (s === 401) return "Avtorizatsiya muddati tugagan — qayta kiring.";
    if (s === 403) return "Ruxsat berilmadi.";
    if (s === 405) return "Server ushbu so‘rov usulini qo‘llab-quvvatlamaydi.";
    if (s === 500) return "Server xatosi (500). Sana (tug‘ilgan sana) YYYY-MM-DD yoki haqiqiy maydonlarni tekshiring; backend jurnalida batafsil xato bo‘ladi.";
    if (s) return `Server xatosi (${s})`;
    return e.message || "Tarmoq xatosi";
  }
  if (e instanceof Error) return e.message;
  return "Noma’lum xato";
}

/** OpenAPI: `UserEditDTO` — `PATCH /user/edit/{userId}`; `age` — `format: date` (odatda `yyyy-MM-dd`). */
function mapUiGenderToApi(s: string): "MALE" | "FEMALE" | "UNKNOWN" | undefined {
  const t = s.trim();
  if (!t) return undefined;
  if (t === "MALE" || t === "FEMALE" || t === "UNKNOWN") return t;
  if (t === "Erkak") return "MALE";
  if (t === "Ayol") return "FEMALE";
  if (t.includes("afzal") || t.includes("Ko'rsatmaslik") || t.includes("Кўрсатмас")) return "UNKNOWN";
  return undefined;
}

/** `DD/MM/YYYY` yoki `DD.MM.YYYY` → `yyyy-MM-dd` (backend `LocalDate` parse uchun). */
function normalizeAgeValue(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    return `${m[3]}-${mm}-${dd}`;
  }
  return s;
}

/**
 * Rasmiy `UserEditDTO` (OpenAPI) kalitlari + ijtimoiy/UID kabi kengaytmalar (bo‘sh bo‘lmasa).
 * Bo‘sh qatorlar yuborilmaydi — bo‘sh `age` / `region` 500 xatoga olib kelishi mumkin.
 */
const USER_EDIT_CORE_KEYS = new Set([
  "firstName",
  "lastName",
  "username",
  "bio",
  "playName",
  "gameID",
  "freeFireName",
  "freeFireUID",
  "mobileLegendsName",
  "steamName",
  "attachmentId",
  "bannerAttachmentId",
  "mobileLegendsUID",
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
]);

function omitEmptyStringOptional(obj: Record<string, unknown>): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === "") continue;
    if (v === undefined) continue;
    o[k] = v;
  }
  return o;
}

export function toUserEditPayload(picked: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(picked)) {
    if (value === undefined) continue;
    if (key === "country") {
      const r = typeof value === "string" ? value.trim() : String(value);
      if (r) out.region = r;
      continue;
    }
    if (key === "birthDate") {
      const a = normalizeAgeValue(value);
      if (a) out.age = a;
      continue;
    }
    if (key === "gender") {
      const m = mapUiGenderToApi(String(value));
      if (m) out.gender = m;
      continue;
    }
    if (!USER_EDIT_CORE_KEYS.has(key)) continue;
    if (key === "attachmentId" || key === "bannerAttachmentId") {
      if (value === null || value === "") continue;
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isNaN(n) && n > 0) out[key] = n;
      continue;
    }
    out[key] = value;
  }
  return omitEmptyStringOptional(out);
}

/**
 * Profilni yangilash — rasmiy API: `PATCH /user/edit/{userId}` (`/v3/api-docs`, `editUserProfile`).
 * `/user/profile/{id}` bo‘yicha qayta terish GET uchun; u yerda PUT/PATCH/POST **yo‘q** (405).
 */
export async function updateUserProfile(userId: number, raw: object) {
  const merged = raw as Record<string, unknown>;
  const picked = pickProfileUpdatePayload(merged);
  if (Object.keys(picked).length === 0) {
    throw new Error("Yuboriladigan maydonlar bo‘sh");
  }
  const body = toUserEditPayload(picked);
  if (Object.keys(body).length === 0) {
    throw new Error("Yuboriladigan maydonlar bo‘sh");
  }
  const { data } = await api.patch(`/user/edit/${userId}`, body);
  return data;
}
