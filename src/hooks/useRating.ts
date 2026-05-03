import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const endpoints: Record<string, string> = {
  PUBG_UC: "/rating/fiftyAllUc",
  STEAM: "/rating/fiftyAllSteam",
  ML: "/rating/fiftyAllML",
  FREE_FIRE: "/rating/fiftyAllFreeFire",
};

function extractRows(payload: unknown): unknown[] {
  if (payload === null || payload === undefined) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];
  const wrap = payload as Record<string, unknown>;

  // common: { data: [...] } yoki { data: { content: [...] } }
  const d = wrap.data;
  if (Array.isArray(d)) return d;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    const obj = d as Record<string, unknown>;
    if (Array.isArray(obj.content)) return obj.content;
    if (Array.isArray(obj.messages)) return obj.messages;
    if (Array.isArray(obj.rows)) return obj.rows;
    if (Array.isArray(obj.list)) return obj.list;
  }

  // some APIs: { content: [...] } / { list: [...] }
  if (Array.isArray(wrap.content)) return wrap.content;
  if (Array.isArray(wrap.list)) return wrap.list;
  if (Array.isArray(wrap.rows)) return wrap.rows;
  return [];
}

export function useRating<T = unknown>(type: string) {
  return useQuery({
    queryKey: ["rating", type],
    enabled: Boolean(type),
    queryFn: async () => {
      if (!type) return [];
      const { data } = await api.get(endpoints[type] ?? "/rating/fiftyAllUc");
      return extractRows(data) as T[];
    },
  });
}
