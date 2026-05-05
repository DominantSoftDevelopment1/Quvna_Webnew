import { api } from "@/lib/api";
import { normalizeChatRecordForParse, parseStreamChatInbound, type ParsedChatLine } from "@/lib/streamChat";

/** GET /api/streamChat/getAllBy/{streamId} */
export async function fetchStreamChatHistory(streamId: string, opts?: { page?: number; size?: number }): Promise<ParsedChatLine[]> {
  const page = opts?.page ?? 0;
  const size = opts?.size ?? 100;
  const encoded = encodeURIComponent(streamId.trim());
  const { data } = await api.get(`/api/streamChat/getAllBy/${encoded}`, {
    params: { page, size },
  });

  const rows = extractRows(data);
  const pairs: { row: Record<string, unknown>; line: ParsedChatLine }[] = [];

  for (const row of rows) {
    const rec = normalizeChatRecordForParse(row);
    const line = parseStreamChatInbound(rec);
    if (!line) continue;
    const ts = rowTimestampMs(row);
    const lineWithTs =
      ts != null && line.sentAtMs == null ? { ...line, sentAtMs: ts } : line;
    pairs.push({ row, line: lineWithTs });
  }

  pairs.sort((a, b) => {
    const ta = rowTimestampMs(a.row);
    const tb = rowTimestampMs(b.row);
    if (ta != null && tb != null && ta !== tb) return ta - tb;
    return 0;
  });

  return pairs.map((p) => p.line);
}

function extractRows(payload: unknown): Record<string, unknown>[] {
  if (payload === null || payload === undefined) return [];
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  const wrap = payload as Record<string, unknown>;
  const data = wrap.data;
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.content)) return d.content as Record<string, unknown>[];
    if (Array.isArray(d.messages)) return d.messages as Record<string, unknown>[];
  }
  if (Array.isArray(wrap.content)) return wrap.content as Record<string, unknown>[];
  if (Array.isArray(wrap.messages)) return wrap.messages as Record<string, unknown>[];
  return [];
}

function rowTimestampMs(raw: Record<string, unknown>): number | null {
  const t = raw.createdAt ?? raw.updatedAt ?? raw.timestamp ?? raw.sentAt;
  if (typeof t === "number" && Number.isFinite(t)) return t > 1e12 ? t : t * 1000;
  if (typeof t === "string") {
    const d = Date.parse(t);
    return Number.isNaN(d) ? null : d;
  }
  return null;
}
