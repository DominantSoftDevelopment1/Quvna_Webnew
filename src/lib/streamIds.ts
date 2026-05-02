/** Stream entity'dan UUID-style id ni topish (har xil backend javob formatlari). */
export function pickStreamEntityId(obj: Record<string, unknown>): string | null {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  for (const key of ["streamId", "streamUuid", "uuid", "id"]) {
    const v = obj[key];
    if (typeof v === "string" && UUID_RE.test(v.trim())) return v.trim();
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return String(v);
  }
  return null;
}

/** REST path uchun numeric ID (PUT /streams/{id} ga kelishadi). */
export function deriveStreamRestPathId(obj: Record<string, unknown>): string | null {
  for (const key of ["restPathId", "numericId", "pk"]) {
    const v = obj[key];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return String(v);
    if (typeof v === "string" && /^\d+$/.test(v.trim())) return v.trim();
  }
  const id = obj["id"];
  if (typeof id === "number" && Number.isFinite(id) && id > 0) return String(id);
  if (typeof id === "string" && /^\d+$/.test(id.trim())) return id.trim();
  return null;
}
