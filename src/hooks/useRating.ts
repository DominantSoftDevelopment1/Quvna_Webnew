import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const endpoints: Record<string, string> = {
  PUBG_UC: "/rating/fiftyAllUc",
  STEAM: "/rating/fiftyAllSteam",
  ML: "/rating/fiftyAllML",
  FREE_FIRE: "/rating/fiftyAllFreeFire",
};

export function useRating(type: string) {
  return useQuery({
    queryKey: ["rating", type],
    queryFn: async () => {
      const { data } = await api.get(endpoints[type] ?? "/rating/fiftyAllUc");
      return data?.data ?? [];
    },
  });
}
