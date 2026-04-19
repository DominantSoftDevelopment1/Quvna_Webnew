import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useBanners() {
  return useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data } = await api.get("/advertising/getAll");
      return data?.data ?? [];
    },
  });
}

export function useDonate() {
  return useQuery({
    queryKey: ["donate"],
    queryFn: async () => {
      const { data } = await api.get("/product/get/byType", { params: { type: "DONATE" } });
      return data?.data ?? [];
    },
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      const { data } = await api.get("/competition");
      return data?.data ?? [];
    },
  });
}

export function useGameClubs() {
  return useQuery({
    queryKey: ["gameClubs"],
    queryFn: async () => {
      const { data } = await api.get("/game-zone/top");
      return data?.data ?? [];
    },
  });
}

export function useGameStore() {
  return useQuery({
    queryKey: ["gameStore"],
    queryFn: async () => {
      const { data } = await api.get("/product/get/byType", { params: { type: "GAME" } });
      return data?.data ?? [];
    },
  });
}
