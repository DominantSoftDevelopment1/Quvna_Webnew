/**
 * Topbar / UI uchun — profildan PUBG UC reyting balini chiqarish.
 * Backend ba'zan camelCase (`ucAmount`), ba'zan snake_case (`uc_amount`) yuborishi mumkin.
 */
export function resolvePubgRatingFromProfile(
  profile: Record<string, unknown> | null | undefined
): number {
  if (!profile || typeof profile !== "object") return 0;

  const r = profile.rating;
  if (typeof r === "number" && Number.isFinite(r) && r >= 0) return Math.floor(r);

  if (r && typeof r === "object" && !Array.isArray(r)) {
    const o = r as Record<string, unknown>;
    const raw =
      o.ucAmount ?? o.uc_amount ?? o.totalUc ?? o.total_uc ?? o.pubgUc ?? o.pubg_uc;
    const n = Number(raw ?? 0);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }

  const total = Number(profile.totalScore ?? profile.total_score ?? 0);
  if (Number.isFinite(total) && total >= 0) return Math.floor(total);

  return 0;
}
