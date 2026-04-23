import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/updateUserProfile";
import { api } from "@/lib/api";

/** Java/Jackson `snake_case` va `camelCase` aralash javoblar uchun (Flutter app bilan bir xil maydonlar). */
function normalizeProfileRow(raw: Record<string, unknown> | null | undefined) {
  if (!raw || typeof raw !== "object") return raw ?? null;
  const c = (camel: string, snake: string) => raw[camel] ?? raw[snake];
  return {
    ...raw,
    telegramUrl: c("telegramUrl", "telegram_url"),
    instagramUrl: c("instagramUrl", "instagram_url"),
    youtubeUrl: c("youtubeUrl", "youtube_url"),
    tiktokUrl: c("tiktokUrl", "tiktok_url"),
    facebookUrl: c("facebookUrl", "facebook_url"),
    discordUrl: c("discordUrl", "discord_url"),
    linkedinUrl: c("linkedinUrl", "linkedin_url"),
    twitterUrl: c("twitterUrl", "twitter_url"),
    websiteUrl: c("websiteUrl", "website_url"),
    donationAlertsUrl: c("donationAlertsUrl", "donation_alerts_url"),
  } as Record<string, unknown>;
}

/**
 * Profil (GET) — `BASE_URL` orqali (lib/constants), axios `api` instance.
 *
 * | Method | Path | Tavsif |
 * |--------|------|--------|
 * | GET | `/user/profile/{userId}` | Profil olish; javob: `{ data: Profile }` |
 * | PATCH, PUT yoki POST | `/user/profile/{userId}` | Yangilash (`lib/updateUserProfile` — 405 bo‘lsa navbatdagi usul) |
 *
 * Boshqa tegishli: obunachilar `GET /api/following/{id}`, reytinglar `GET /rating/fiftyAllUc` va hokazo (`useRating`).
 *
 * ---
 * **Mobil (Flutter) bilan moslik** — bitta API (`BASE_URL`, default prod domen), `Authorization: Bearer` header.
 * Mobil loyiha: `quvna_mobile` (Git repoga jamoa ichida kirish kerak; ochiq URL mavjud emas).
 * Ijtimoiy: `telegramUrl` … `websiteUrl` (yuqorida) — yuborishda ham o‘sha nomlar; backend boshqacha bo‘lsa
 * DTO/serializatorni tekshiring. Yangilash: `src/lib/updateUserProfile.ts` — `PATCH` → `PUT` → `POST` (405 bo‘lsa keyingisi).
 * O‘yin: `playName`, `gameID`, `freeFireName`, `freeFireUID`, `mobileLegendsName`, `mobileLegendsUID`, `steamName`, `hideGameInfo`.
 */
export function useProfile(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data } = await api.get(`/user/profile/${userId}`);
      const row = data?.data ?? null;
      return row ? normalizeProfileRow(row) : null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFollowers(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/followers/${userId}`, { params: { page: 0, size: 20 } });
        const raw = data?.data;
        return Array.isArray(raw) ? raw : (raw?.content ?? []);
      } catch { return []; }
    },
    enabled: !!userId,
  });
}

export function useFollowing(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/following/${userId}`, { params: { page: 0, size: 20 } });
        const raw = data?.data;
        return Array.isArray(raw) ? raw : (raw?.content ?? []);
      } catch { return []; }
    },
    enabled: !!userId,
  });
}

export function useUserVideos(userId: number | null | undefined) {
  return useQuery({
    queryKey: ["userVideos", userId],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/api/video/getUserVideos/${userId}`, { params: { page: 0, size: 20 } });
        const raw = data?.data;
        return Array.isArray(raw) ? raw : (raw?.content ?? []);
      } catch { return []; }
    },
    enabled: !!userId,
  });
}

export function useEditProfile() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
      baseProfile,
    }: {
      userId: number;
      data: Record<string, unknown>;
      baseProfile?: Record<string, unknown> | null;
    }) => {
      const payload =
        baseProfile && typeof baseProfile === "object"
          ? { ...baseProfile, ...data }
          : data;
      return updateUserProfile(userId, payload as object);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      router.push("/profile");
    },
  });
}
