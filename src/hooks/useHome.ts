import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type DonateProductType = "UC" | "FREE_FIRE" | "MOBILE_LEGENDS" | "STEAM";
export type PaymentServiceType = "OSON" | "OCTO";

export interface DonateProduct {
  id: number;
  productName?: string;
  price: number | string;
  bonus?: number;
  amount?: number;
  totalAmount?: number;
  productType: DonateProductType;
}

export interface CreateOrderItemPayload {
  productId: number;
  price: number;
  productCount: number;
}

export interface CreateOrderPayload {
  orderItems: CreateOrderItemPayload[];
  payType: "SUM";
  playerId?: string;
  playerName?: string;
  btsAddress?: string;
  userAddress?: string;
  phoneNumber?: string;
  fullName?: string;
  isCupon: boolean;
  isDeliveryHome?: boolean;
  userAddressCityId?: number;
  btsBranchId?: number;
  paymentServiceType: PaymentServiceType;
}

export interface CreateOrderResult {
  url?: string;
  orderId?: number;
}

function findFirstUrl(input: unknown): string | undefined {
  if (!input) return undefined;
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return undefined;
  }
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findFirstUrl(item);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key.toLowerCase().includes("url")) {
        const found = findFirstUrl(value);
        if (found) return found;
      }
    }
    for (const value of Object.values(record)) {
      const found = findFirstUrl(value);
      if (found) return found;
    }
  }
  return undefined;
}

function findFirstOrderId(input: unknown): number | undefined {
  if (!input) return undefined;
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const parsed = Number(input.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (Array.isArray(input)) {
    for (const item of input) {
      const found = findFirstOrderId(item);
      if (typeof found === "number") return found;
    }
    return undefined;
  }
  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key.toLowerCase().includes("orderid")) {
        const found = findFirstOrderId(value);
        if (typeof found === "number") return found;
      }
    }
    for (const value of Object.values(record)) {
      const found = findFirstOrderId(value);
      if (typeof found === "number") return found;
    }
  }
  return undefined;
}

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
      const { data } = await api.get("/product/get/byType", {
        params: { type: "DONATE" },
      });
      return data?.data ?? [];
    },
  });
}

export function useDonateProducts(type: DonateProductType) {
  return useQuery({
    queryKey: ["donate-products", type],
    queryFn: async () => {
      const { data } = await api.get("/product/get/byType", {
        params: {
          type,
          _ts: Date.now(),
        },
      });
      return (data?.data ?? []) as DonateProduct[];
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export function useCreateDonateOrder() {
  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await api.post("/order", payload);
      const body = data ?? {};
      const url = findFirstUrl(body);
      const orderId = findFirstOrderId(body);
      return { url, orderId } as CreateOrderResult;
    },
  });
}

export function fetchOrderHistoryByType(
  userId: number,
  productType: DonateProductType,
  page = 0,
  size = 10
) {
  return api.get(`/order/list/V2/${userId}`, {
    params: { page, size, productType },
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
