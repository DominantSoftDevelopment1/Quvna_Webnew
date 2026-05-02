"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  DonateProductType,
  PaymentServiceType,
  fetchOrderHistoryByType,
  useCreateDonateOrder,
  useDonateProducts,
} from "@/hooks/useHome";
import { useAuthStore } from "@/store/auth.store";
import { CATEGORY_AMBIENT_BG_CLASS, GAME_CATEGORY_BACKGROUND } from "@/lib/categoryGameBackgrounds";

type DonateId = "pubg" | "ml" | "freefire" | "steam";
type PubgTab = "uid" | "promo";
type PaymentState = "idle" | "success" | "error";
type PaymentProvider = "OSON" | "OCTO";
type PubgUidStep = "catalog" | "identity";
type SteamCurrency = "UZS" | "USD";

const STEAM_USD_TO_UZS_RATE = 13_000;
const DISPLAY_LOCALE = "ru-RU";

interface DonatePackage {
  amount: number | string;
  price?: number;
  bonus?: string;
  image?: string;
  productId?: number;
}

interface DonateProduct {
  name: string;
  image: string;
  subtitle: string;
  totalCount: number;
  packages: DonatePackage[];
}

interface SavedIdentity {
  uid: string;
  nickname: string;
}

const DONATE_DATA: Record<DonateId, DonateProduct> = {
  pubg: {
    name: "PUBG Mobile UC",
    image: "/images/profile-games/pubgmobile.png",
    subtitle: "ID orqali",
    totalCount: 17,
    packages: [
      { amount: 60, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_60.png" },
      { amount: 300, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_300.png" },
      { amount: 600, price: 57_000, image: "/images/donate/pubg/pubg_300.png" },
      { amount: 1200, price: 57_000, image: "/images/donate/pubg/pubg_1200.png" },
      { amount: 2400, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_2400.png" },
      { amount: 4800, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_4800.png" },
      { amount: 9600, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_9600.png" },
      { amount: 10000, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_10000.png" },
      { amount: 16600, price: 57_000, bonus: "+20 UC", image: "/images/donate/pubg/pubg_16600.png" },
    ],
  },
  ml: {
    name: "Mobile Legends",
    image: "/images/profile-games/mobilelegends.png",
    subtitle: "Sotib olish",
    totalCount: 15571,
    packages: [
      { amount: 100, price: 57_000, image: "/images/donate/ml/ml_100.png" },
      { amount: 400, price: 57_000, image: "/images/donate/ml/ml_400.png" },
      { amount: 800, price: 57_000, image: "/images/donate/ml/ml_800.png" },
      { amount: 1600, price: 57_000, image: "/images/donate/ml/ml_1600.png" },
      { amount: 3400, price: 57_000, image: "/images/donate/ml/ml_3400.png" },
      { amount: 6800, price: 57_000, image: "/images/donate/ml/ml_6800.png" },
      { amount: 10000, price: 57_000, image: "/images/donate/ml/ml_3400.png" },
      { amount: 6800, price: 57_000, image: "/images/donate/ml/ml_6800.png" },
    ],
  },
  freefire: {
    name: "Sotib olish",
    image: "/images/donate/freefire/freefire_logo.png",
    subtitle: "ID orqali sotib olish",
    totalCount: 5,
    packages: [
      { amount: "100 almaz", price: 12_000_000 },
      { amount: "200 almaz", price: 12_000_000 },
      { amount: "530 almaz", price: 12_000_000 },
      { amount: "1080 almaz", price: 12_000_000 },
      { amount: "2200 almaz", price: 12_000_000 },
    ],
  },
  steam: {
    name: "STEAM",
    image: "/images/donate/steam/steam_logo.png",
    subtitle: "Steamda balansingizni to'ldiring",
    totalCount: 0,
    packages: [
      { amount: 15000, price: 15_000 },
      { amount: 25000, price: 25_000 },
      { amount: 100000, price: 100_000 },
      { amount: 100000, price: 100_000 },
    ],
  },
};

const PRODUCT_TYPE_BY_ID: Record<DonateId, DonateProductType> = {
  pubg: "UC",
  ml: "MOBILE_LEGENDS",
  freefire: "FREE_FIRE",
  steam: "STEAM",
};

const PACKAGE_IMAGE_BY_ID: Record<DonateId, string[]> = {
  pubg: [
    "/images/donate/pubg/pubg_60.png",
    "/images/donate/pubg/pubg_300.png",
    "/images/donate/pubg/pubg_300.png",
    "/images/donate/pubg/pubg_1200.png",
    "/images/donate/pubg/pubg_2400.png",
    "/images/donate/pubg/pubg_4800.png",
    "/images/donate/pubg/pubg_9600.png",
    "/images/donate/pubg/pubg_10000.png",
    "/images/donate/pubg/pubg_16600.png",
  ],
  ml: [
    "/images/donate/ml/ml_100.png",
    "/images/donate/ml/ml_400.png",
    "/images/donate/ml/ml_800.png",
    "/images/donate/ml/ml_1600.png",
    "/images/donate/ml/ml_3400.png",
    "/images/donate/ml/ml_6800.png",
    "/images/donate/ml/ml_3400.png",
    "/images/donate/ml/ml_6800.png",
  ],
  freefire: ["/images/donate/freefire/freefire_logo.png"],
  steam: ["/images/donate/steam/steam_logo.png"],
};


export default function DonateDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const routeIdRaw = Array.isArray(params.id) ? params.id[0] : params.id;
  const routeId = String(routeIdRaw ?? "pubg").toLowerCase().trim();
  const donateId: DonateId =
    routeId === "pubg" || routeId === "ml" || routeId === "freefire" || routeId === "steam"
      ? (routeId as DonateId)
      : "pubg";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const item = DONATE_DATA[donateId];
  const resolvedItem = item;
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(donateId === "ml" ? -1 : 0);
  const [activePubgTab, setActivePubgTab] = useState<PubgTab>(
    searchParams.get("mode") === "promo" ? "promo" : "uid"
  );
  const [pubgUidStep, setPubgUidStep] = useState<PubgUidStep>("catalog");
  const [freefireUidStep, setFreefireUidStep] = useState<"catalog" | "identity">("catalog");
  const [savedIdentities, setSavedIdentities] = useState<SavedIdentity[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("donate_pubg_identities");
      const parsed = raw ? (JSON.parse(raw) as SavedIdentity[]) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
    } catch {
      return [];
    }
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [freefireUidConfirmOpen, setFreefireUidConfirmOpen] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("OSON");
  const [steamCurrency, setSteamCurrency] = useState<SteamCurrency>("UZS");
  const [steamAmountInput, setSteamAmountInput] = useState("");
  const [isIframeOpen, setIsIframeOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const productType = PRODUCT_TYPE_BY_ID[donateId];
  const donateProductsQuery = useDonateProducts(productType);
  const createOrderMutation = useCreateDonateOrder();

  const backendPackages = useMemo<DonatePackage[]>(() => {
    const products = donateProductsQuery.data ?? [];
    if (!products.length) return resolvedItem.packages;
    const packageImages = PACKAGE_IMAGE_BY_ID[donateId];

    return products.map((product, index) => ({
      amount:
        product.totalAmount ?? product.amount ?? resolvedItem.packages[index]?.amount ?? 0,
      price: (() => {
        const parsed =
          typeof product.price === "number"
            ? product.price
            : Number(String(product.price ?? "").trim());
        return Number.isFinite(parsed) ? parsed : 0;
      })(),
      bonus:
        product.bonus && product.bonus > 0
          ? `+${product.bonus} ${donateId === "pubg" ? "UC" : donateId === "ml" ? "💎" : ""}`
          : resolvedItem.packages[index]?.bonus,
      image:
        packageImages[index] ??
        resolvedItem.packages[index]?.image ??
        resolvedItem.image,
      productId: product.id,
    }));
  }, [donateProductsQuery.data, donateId, resolvedItem.image, resolvedItem.packages]);
  const hasBackendProducts = (donateProductsQuery.data?.length ?? 0) > 0;

  const currentPackage = backendPackages[selectedIndex] ?? backendPackages[0] ?? null;
  const isCurrentPackageReady =
    Boolean(currentPackage?.productId ?? backendPackages[0]?.productId) &&
    Number(resolvePackagePrice(currentPackage) ?? 0) > 0;

  useEffect(() => {
    void donateProductsQuery.refetch();
    // Pagega kirganda narxlar doim qayta olinadi
  }, [donateId, donateProductsQuery.refetch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(`donate_form_snapshot_${donateId}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        userId?: string;
        nickname?: string;
        steamAmountInput?: string;
        steamCurrency?: SteamCurrency;
      };
      setUserId(parsed.userId ?? "");
      setNickname(parsed.nickname ?? "");
      setSteamAmountInput(parsed.steamAmountInput ?? "");
      if (parsed.steamCurrency === "UZS" || parsed.steamCurrency === "USD") {
        setSteamCurrency(parsed.steamCurrency);
      }
    } catch {
      // ignore broken snapshot
    }
  }, [donateId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const snapshot = {
      userId,
      nickname,
      steamAmountInput,
      steamCurrency,
    };
    localStorage.setItem(`donate_form_snapshot_${donateId}`, JSON.stringify(snapshot));
  }, [donateId, userId, nickname, steamAmountInput, steamCurrency]);

  function resolvePackagePrice(pkg?: DonatePackage | null): number | undefined {
    if (!pkg) return undefined;
    return typeof pkg.price === "number" && Number.isFinite(pkg.price) ? pkg.price : 0;
  }

  function formatMoney(value?: number): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "0";
    return value.toLocaleString(DISPLAY_LOCALE, { maximumFractionDigits: 2 });
  }

  function formatDisplayNumber(value?: number): string {
    if (typeof value !== "number" || !Number.isFinite(value)) return "0";
    return value.toLocaleString(DISPLAY_LOCALE, { maximumFractionDigits: 0 });
  }

  function formatNumberInput(value: string): string {
    const digitsOnly = value.replace(/[^\d]/g, "");
    if (!digitsOnly) return "";
    return Number(digitsOnly).toLocaleString("en-US");
  }

  function parseNumberInput(value: string): number {
    const cleaned = value.replace(/[^\d]/g, "");
    if (!cleaned) return 0;
    return Number(cleaned);
  }

  function validateSteamLogin(login: string): boolean {
    const trimmed = login.trim();
    return /^[a-zA-Z0-9._-]{3,32}$/.test(trimmed);
  }

  function persistSavedIdentities(next: SavedIdentity[]) {
    setSavedIdentities(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("donate_pubg_identities", JSON.stringify(next));
    }
  }

  function addIdentityToHistory(uid: string, name: string) {
    const cleaned: SavedIdentity = { uid: uid.trim(), nickname: name.trim() };
    if (!cleaned.uid || !cleaned.nickname) return;
    const deduped = savedIdentities.filter(
      (item) =>
        item.uid.toLowerCase() !== cleaned.uid.toLowerCase() ||
        item.nickname.toLowerCase() !== cleaned.nickname.toLowerCase()
    );
    persistSavedIdentities([cleaned, ...deduped].slice(0, 8));
  }

  function deleteSavedIdentity(uid: string, name: string) {
    const next = savedIdentities.filter(
      (item) =>
        !(item.uid.toLowerCase() === uid.toLowerCase() &&
          item.nickname.toLowerCase() === name.toLowerCase())
    );
    persistSavedIdentities(next);
  }

  function normalizeOrderStatus(value?: string | null): string {
    return String(value ?? "").toUpperCase();
  }

  function isRejectedStatus(value?: string | null): boolean {
    const status = normalizeOrderStatus(value);
    return (
      status.includes("ERROR") ||
      status.includes("CANCEL") ||
      status.includes("REJECT") ||
      status.includes("REFUSED")
    );
  }

  function detectPaymentState(url: string): PaymentState {
    const lower = url.toLowerCase();
    if (
      lower.includes("payment_status=succeeded") ||
      lower.includes("payment_status=success") ||
      lower.includes("status=success") ||
      lower.includes("succeeded")
    ) {
      return "success";
    }
    if (
      lower.includes("payment_status=failed") ||
      lower.includes("payment_status=error") ||
      lower.includes("status=failed") ||
      lower.includes("error") ||
      lower.includes("canceled")
    ) {
      return "error";
    }
    return "idle";
  }

  async function isRetryFromRejectedStatus(): Promise<boolean> {
    const numericUserId = user?.id ? Number(user.id) : null;
    if (!numericUserId || donateId !== "pubg" || activePubgTab !== "uid") return false;

    const { data } = await fetchOrderHistoryByType(
      numericUserId,
      PRODUCT_TYPE_BY_ID.pubg,
      0,
      20
    );
    const history = Array.isArray(data?.data) ? data.data : [];
    return history.some((order: Record<string, unknown>) => {
      const playerIdValue = String(order.playerId ?? "").trim();
      const playerNameValue = String(order.playerName ?? "").trim().toLowerCase();
      const matchesIdentity =
        playerIdValue === userId.trim() &&
        playerNameValue === nickname.trim().toLowerCase();
      return matchesIdentity && isRejectedStatus(String(order.orderStatus ?? ""));
    });
  }

  async function handlePurchase(packageIndex?: number) {
    setSubmitError(null);
    if (donateId === "pubg" && activePubgTab === "uid" && pubgUidStep === "catalog") {
      setPubgUidStep("identity");
      return;
    }
    if (donateId === "freefire" && freefireUidStep === "catalog") {
      if (typeof packageIndex === "number") {
        setSelectedIndex(packageIndex);
      }
      setFreefireUidStep("identity");
      return;
    }

    const selectedPackage =
      typeof packageIndex === "number"
        ? backendPackages[packageIndex] ?? currentPackage
        : currentPackage;

    const steamAmountRaw = parseNumberInput(steamAmountInput);
    const steamAmountInUzs =
      steamCurrency === "USD" ? steamAmountRaw * STEAM_USD_TO_UZS_RATE : steamAmountRaw;
    const effectiveProductId = selectedPackage?.productId ?? backendPackages[0]?.productId;
    const selectedPackagePrice =
      donateId === "steam" ? steamAmountInUzs : resolvePackagePrice(selectedPackage);

    if (!effectiveProductId || typeof selectedPackagePrice !== "number" || selectedPackagePrice <= 0) {
      setSubmitError("Narxlar yuklanmoqda, birozdan keyin qayta urinib ko'ring.");
      if (!hasBackendProducts) {
        void donateProductsQuery.refetch();
      }
      return;
    }

    if (donateId === "steam") {
      if (!validateSteamLogin(userId)) {
        setSubmitError("Steam login noto'g'ri. 3-32 ta harf/raqam (._-) kiriting.");
        return;
      }
      if (!steamAmountRaw) {
        setSubmitError("To'lov summasini kiriting.");
        return;
      }
    }

    if (donateId === "pubg" && activePubgTab === "uid" && pubgUidStep === "identity") {
      if (!userId.trim() || !nickname.trim()) {
        setSubmitError("UID va nickname kiriting.");
        return;
      }
    }

    if (donateId === "freefire") {
      if (!userId.trim()) {
        setSubmitError("Free Fire UID kiriting.");
        return;
      }
      if (!/^\d{5,20}$/.test(userId.trim())) {
        setSubmitError("Free Fire UID faqat raqamlardan iborat bo'lishi kerak.");
        return;
      }
      setFreefireUidConfirmOpen(true);
      return;
    }

    setProviderModalOpen(true);
  }

  async function confirmPaymentProvider(
    providerOverride?: PaymentProvider,
    packageOverride?: DonatePackage
  ) {
    setSubmitError(null);
    const packageForOrder = packageOverride ?? currentPackage ?? backendPackages[0] ?? null;
    const steamAmountRaw = parseNumberInput(steamAmountInput);
    const steamAmountInUzs =
      steamCurrency === "USD" ? steamAmountRaw * STEAM_USD_TO_UZS_RATE : steamAmountRaw;
    const effectiveProductId = packageForOrder?.productId ?? backendPackages[0]?.productId;
    const currentPackagePrice =
      donateId === "steam" ? steamAmountInUzs : resolvePackagePrice(packageForOrder);
    if (!effectiveProductId || typeof currentPackagePrice !== "number" || currentPackagePrice <= 0) {
      setSubmitError("Narxlar yuklanmoqda, birozdan keyin qayta urinib ko'ring.");
      return;
    }

    try {
      const selectedProvider = providerOverride ?? paymentProvider;
      const shouldSkipIframe = await isRetryFromRejectedStatus();
      const playerIdValue =
        donateId === "steam"
          ? userId.trim()
          : donateId === "pubg" && activePubgTab === "uid"
            ? userId.trim()
            : donateId === "freefire"
              ? userId.trim()
              : "";
      const playerNameValue =
        donateId === "pubg" && activePubgTab === "uid"
          ? nickname.trim()
          : donateId === "freefire"
            ? userId.trim()
            : "";
      const response = await createOrderMutation.mutateAsync({
        orderItems: [
          {
            productId: effectiveProductId,
            price: Number(currentPackagePrice),
            productCount: 1,
          },
        ],
        payType: "SUM",
        playerId: playerIdValue,
        playerName: playerNameValue,
        isCupon: donateId === "pubg" && activePubgTab === "promo",
        paymentServiceType: selectedProvider as PaymentServiceType,
      });

      if (donateId === "pubg" && activePubgTab === "uid") {
        addIdentityToHistory(userId, nickname);
      }

      if (shouldSkipIframe) {
        setProviderModalOpen(false);
        router.push("/profile/history?tab=UC");
        return;
      }

      if (!response?.url) {
        const debugShape = Object.keys((response as Record<string, unknown>) ?? {}).join(", ");
        console.log("[DONATE_DEBUG] createOrder response without url", response);
        setSubmitError(
          `To'lov havolasi topilmadi. Response keys: ${debugShape || "empty"}`
        );
        return;
      }

      setPaymentState("idle");
      setPaymentUrl(response.url);
      setProviderModalOpen(false);
      const openedWindow = window.open(response.url, "_blank", "noopener,noreferrer");
      if (!openedWindow) {
        // Popup blok bo'lsa, avvalgi iframe fallback ishlaydi.
        setIsIframeOpen(true);
      }
    } catch (err: unknown) {
      const errorData = (err as { response?: { data?: unknown; status?: number } })?.response?.data;
      const statusCode = (err as { response?: { status?: number } })?.response?.status;
      const backendMsg =
        (err as { response?: { data?: { message?: string; errors?: Array<{ msg?: string }> } } })?.response?.data
          ?.message ||
        (err as { response?: { data?: { errors?: Array<{ msg?: string }> } } })?.response?.data?.errors?.[0]?.msg;
      console.log("[DONATE_DEBUG] createOrder error", { statusCode, errorData, err });
      try {
        console.log("[DONATE_DEBUG] createOrder error json", JSON.stringify(errorData));
      } catch {}
      if (String(backendMsg ?? "").toLowerCase().includes("access denied") || statusCode === 401 || statusCode === 403) {
        setSubmitError("Sessiya tugagan yoki ruxsat yo'q. Qayta login qiling.");
        router.push("/auth/login");
        return;
      }
      setSubmitError(
        `${backendMsg || "Xaridni boshlab bo'lmadi. Qayta urinib ko'ring."}${statusCode ? ` (status: ${statusCode})` : ""}`
      );
    }
  }

  function handleIframeLoad() {
    if (!iframeRef.current) return;
    try {
      const currentUrl = iframeRef.current.contentWindow?.location?.href;
      if (!currentUrl) return;
      const detected = detectPaymentState(currentUrl);
      if (detected === "success") {
        setPaymentState("success");
        setIsIframeOpen(false);
        router.push("/profile/history");
      } else if (detected === "error") {
        setPaymentState("error");
      }
    } catch {
      // cross-origin iframe; detection may be unavailable until redirect comes back.
    }
  }

  const ambientBg = GAME_CATEGORY_BACKGROUND[donateId];

  return (
    <div className="min-h-[100dvh] w-full bg-black text-white box-border">
      <div className="relative min-h-screen overflow-hidden box-border">
        <div
          className={CATEGORY_AMBIENT_BG_CLASS}
          style={{
            backgroundImage: ` ${ambientBg.overlay}, url('${ambientBg.image ?? item.image}')`,
            backgroundSize: "cover",
            backgroundPosition: ambientBg.position ?? "center",
          }}
        />

        <main className="relative z-10 mx-auto w-full max-w-[1180px] min-w-0 box-border px-6 py-10 lg:px-10 lg:py-12">
          <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (donateId === "pubg" && pubgUidStep === "identity") {
                  setPubgUidStep("catalog");
                  return;
                }
                if (donateId === "freefire" && freefireUidStep === "identity") {
                  setFreefireUidStep("catalog");
                  return;
                }
                router.back();
              }}
              className="-ml-1 grid h-11 w-11 place-items-center rounded-full text-white transition"
              aria-label="Orqaga"
            >
              <img src="/icons/back_left.svg" alt="" width={72} height={72} className="-scale-x-100 brightness-0 invert opacity-100" />
            </button>
            <div />
            <div className="w-11" />
          </header>

          {donateId === "steam" && (
            <section className="relative z-10 flex min-h-[calc(100%-92px)] w-full min-w-0 items-start justify-center px-4 pt-[70px] pb-10 box-border">
              <div className="flex w-full max-w-[920px] min-w-0 min-h-[520px] flex-col items-start justify-center rounded-[26px] border border-white/12 bg-black/55 px-[100px] pt-[50px] pb-[30px] shadow-[0_28px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl box-border">
                <div className="mx-auto flex w-full max-w-[760px] min-w-0 flex-col items-end justify-end gap-10 px-[30px]">
                  <div className="mx-auto flex flex-col items-center pt-4 text-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="mx-auto mb-3 block h-[58px] w-[58px] rounded-full object-cover shadow-[0_0_28px_rgba(40,150,255,0.45)]"
                    />

                    <h1 className="text-[34px] font-bold leading-tight text-white">
                      Steamda balansingizni to&apos;ldiring
                    </h1>

                    <p className="mt-3 max-w-[520px] text-[17px] leading-[1.45] text-white/70">
                      Oson va tez Steam akkauntingizni to&apos;ldirishingiz mumkin!
                    </p>
                  </div>

                  <div className="grid w-full place-items-end">
                    <div className="flex w-full max-w-[560px] min-w-0 flex-col gap-5">
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Steam loginingizni kiriting"
                        className="h-[58px] w-full min-w-0 rounded-2xl border border-[#03ff93]/70 bg-[#1c1c1c]/90 px-6 text-center text-[16px] font-semibold text-white placeholder:text-white/35 outline-none shadow-[0_0_0_1px_rgba(3,255,147,0.12),0_14px_35px_rgba(0,0,0,0.45)] transition focus:border-[#03ff93] focus:shadow-[0_0_0_3px_rgba(3,255,147,0.16),0_18px_45px_rgba(0,0,0,0.55)]"
                      />

                  <div className="flex min-w-0 flex-wrap justify-center gap-x-5 gap-y-2">
                    {["lord157", "lord157...", "kia157", "lord157"].map((login, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setUserId(login.replace("...", ""))}
                        className="text-[15px] font-bold text-[#03ff93] transition hover:text-[#72ffc4]"
                      >
                        <span className="text-[#03ff93]/70">login:</span>
                        {login}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={steamAmountInput}
                      onChange={(e) => setSteamAmountInput(formatNumberInput(e.target.value))}
                      placeholder="Summani kiriting"
                      inputMode="numeric"
                      className="h-[58px] w-full min-w-0 rounded-2xl border border-white/18 bg-[#1f1f1f]/92 px-6 pr-[120px] text-center text-[16px] font-semibold text-white placeholder:text-white/35 outline-none shadow-[0_14px_35px_rgba(0,0,0,0.45)] transition focus:border-[#03ff93]/80"
                    />

                    <div className="absolute inset-y-0 right-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSteamCurrency("UZS")}
                        className={`text-[15px] font-bold ${
                          steamCurrency === "UZS" ? "text-[#03ff93]" : "text-white/50"
                        }`}
                      >
                        UZS
                      </button>

                      <span className="text-white/25">|</span>

                      <button
                        type="button"
                        onClick={() => setSteamCurrency("USD")}
                        className={`text-[15px] font-bold ${
                          steamCurrency === "USD" ? "text-[#03ff93]" : "text-white/50"
                        }`}
                      >
                        USD
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-[13px] text-white/55">
                    {steamCurrency === "USD"
                      ? `To'lov: ${steamAmountInput || "0"} USD (~${formatMoney(
                          parseNumberInput(steamAmountInput) * STEAM_USD_TO_UZS_RATE
                        )} UZS)`
                      : `To'lov: ${steamAmountInput || "0"} UZS`}
                  </p>

                      <button
                        type="button"
                        onClick={() => void handlePurchase()}
                        disabled={createOrderMutation.isPending}
                        className="mt-3 h-[54px] w-full rounded-2xl bg-[#03ff93] text-[17px] font-bold text-[#07110d] shadow-[0_18px_45px_rgba(3,255,147,0.22)] transition hover:brightness-110 disabled:cursor-default disabled:opacity-60"
                      >
                        {createOrderMutation.isPending ? "Yuborilmoqda..." : "To'lov"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {donateId === "ml" && (
            <section className="mt-8 flex min-w-0 flex-col gap-7 box-border">
              <div className="flex items-center gap-2 text-[16px]">
                <span className="font-medium">Barchasi</span>
                <span className="inline-block h-1 w-1 rounded-full bg-[#d5d7da]" />
                <span className="text-[#d5d7da]">{formatDisplayNumber(item.totalCount)}</span>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-5 box-border sm:grid-cols-3 lg:grid-cols-4">
                {backendPackages.map((pkg, i) => (
                  <article
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!pkg.productId || createOrderMutation.isPending) return;
                      setSelectedIndex(i);
                      void handlePurchase(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      if (!pkg.productId || createOrderMutation.isPending) return;
                      setSelectedIndex(i);
                      void handlePurchase(i);
                    }}
                    className="min-w-0 flex min-h-[260px] cursor-pointer flex-col items-center justify-start gap-4 rounded-2xl border border-[#2f352f] bg-[#121714]/90 p-5 box-border shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#03ff93]/70 hover:bg-[#17201b]"
                  >
                    <img src={pkg.image ?? item.image} alt={item.name} className="mx-auto h-[120px] w-[120px] object-contain" />
                    <p className="mt-4 whitespace-nowrap text-[30px] font-bold leading-none tracking-tight">
                      {typeof pkg.amount === "number" ? formatDisplayNumber(Number(pkg.amount)) : String(pkg.amount)}
                      {pkg.bonus && <span className="ml-1 align-middle text-[11px] font-bold text-[#03ff93]">{pkg.bonus}</span>}
                    </p>
                    <div className="mt-3 w-full border-t border-dashed border-[#425242]/80" />
                    <div className="mt-5 w-full min-w-0 box-border">
                      <p className="mt-2 text-center whitespace-nowrap text-[22px] font-semibold leading-none text-white/95">
                        {formatMoney(resolvePackagePrice(pkg))} so&apos;m
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {donateId === "pubg" && pubgUidStep === "catalog" && (
            <section className="mt-8 flex min-w-0 flex-col gap-7 box-border">
              <div className="w-full max-w-[520px] rounded-2xl border border-[#292929] bg-[#1c1c1c]/90 p-[4px]">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setActivePubgTab("uid")}
                    className={`h-12 rounded-xl text-[16px] ${activePubgTab === "uid" ? "bg-[#03ff93] font-semibold text-black" : "text-[#d5d7da]"}`}
                  >
                    UID orqali
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePubgTab("promo");
                      setPubgUidStep("catalog");
                    }}
                    className={`h-12 rounded-xl text-[16px] ${activePubgTab === "promo" ? "bg-[#03ff93] font-semibold text-black" : "text-[#d5d7da]"}`}
                  >
                    Promokod olish
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[16px]">
                <span className="font-medium">Barchasi</span>
                <span className="inline-block h-1 w-1 rounded-full bg-[#d5d7da]" />
                <span className="text-[#d5d7da]">{item.totalCount}</span>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-5 box-border sm:grid-cols-3 lg:grid-cols-4">
                {backendPackages.map((pkg, i) => (
                  <article
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (createOrderMutation.isPending || (pubgUidStep !== "catalog" && !pkg.productId)) return;
                      setSelectedIndex(i);
                      if (activePubgTab === "uid" && pubgUidStep === "catalog") {
                        setSubmitError(null);
                        setPubgUidStep("identity");
                        return;
                      }
                      void handlePurchase(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      if (createOrderMutation.isPending || (pubgUidStep !== "catalog" && !pkg.productId)) return;
                      setSelectedIndex(i);
                      if (activePubgTab === "uid" && pubgUidStep === "catalog") {
                        setSubmitError(null);
                        setPubgUidStep("identity");
                        return;
                      }
                      void handlePurchase(i);
                    }}
                    className="min-w-0 flex min-h-[260px] cursor-pointer flex-col items-center justify-start gap-4 rounded-2xl border border-[#2f352f] bg-[#121714]/90 p-5 box-border shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#03ff93]/70 hover:bg-[#17201b]"
                  >
                    <img src={pkg.image ?? item.image} alt={item.name} className="mx-auto h-[120px] w-[120px] object-contain" />
                    <p className="mt-4 whitespace-nowrap text-[30px] font-bold leading-none tracking-tight">
                      {formatDisplayNumber(Number(pkg.amount))} UC{" "}
                      {pkg.bonus && <span className="ml-1 align-middle text-[11px] font-bold text-[#03ff93]">{pkg.bonus}</span>}
                    </p>
                    <div className="mt-3 w-full border-t border-dashed border-[#425242]/80" />
                    <div className="mt-5 w-full min-w-0 box-border">
                      <p className="mt-2 text-center whitespace-nowrap text-[22px] font-semibold leading-none text-white/95">
                        {formatMoney(resolvePackagePrice(pkg))} so&apos;m
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {donateId === "pubg" && pubgUidStep === "identity" && (
            <section className="relative z-10 mt-6 flex w-full min-w-0 items-start justify-center px-4 pb-10 box-border md:mt-0 md:pt-[70px]">
              <div className="flex w-full max-w-[920px] min-w-0 flex-col items-center justify-center rounded-[26px] border border-white/12 bg-black/55 px-6 py-10 shadow-[0_28px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl box-border min-h-[590px] md:min-h-[620px] md:px-[100px] md:pt-[64px] md:pb-[44px]">
              <div className="mx-auto my-5 flex w-full max-w-[560px] min-w-0 flex-col gap-7 px-1 py-4 md:my-6 md:py-5">
              <div className="flex flex-col items-center gap-2 text-center">
                <img src="/images/profile-games/pubgmobile.png" alt="PUBG" className="h-[72px] w-auto rounded-xl object-contain" />
                <h2 className="text-[24px] font-semibold leading-tight md:text-[32px]">UID orqali sotib olish</h2>
                <p className="text-[14px] leading-[1.5] text-white/85">
                  Sotib olish uchun o&apos;z UID va nicknameingizni kiriting
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-5">
                <input
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="UID kiriting"
                  className="h-[58px] w-full rounded-xl border border-[#292929] bg-[#1c1c1c] pl-6 pr-4 text-[15px] leading-[1.35] text-white placeholder:text-[#8a8ea1] outline-none transition hover:border-[#3a3a3a] focus:border-[#03ff93]/60"
                  style={{ paddingLeft: "28px", paddingRight: "16px" }}
                />
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Nicknameingizni kiriting"
                  className="h-[58px] w-full rounded-xl border border-[#292929] bg-[#1c1c1c] pl-6 pr-4 text-[15px] leading-[1.35] text-white placeholder:text-[#8a8ea1] outline-none transition hover:border-[#3a3a3a] focus:border-[#03ff93]/60"
                  style={{ paddingLeft: "28px", paddingRight: "16px" }}
                />
              </div>

              {!!savedIdentities.length && (
                <div className="min-w-0 overflow-x-auto pb-1">
                  <div className="flex min-w-max gap-3">
                    {savedIdentities.map((itemValue, idx) => (
                      <div
                        key={`${itemValue.uid}-${itemValue.nickname}-${idx}`}
                        className="relative shrink-0 rounded-2xl border border-[#292929] bg-[#1c1c1c] px-4 py-2.5 pr-8"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setUserId(itemValue.uid);
                            setNickname(itemValue.nickname);
                          }}
                          className="text-left"
                        >
                          <p className="text-[12px] leading-[1.35] text-[#667085]">UID: {itemValue.uid}</p>
                          <p className="text-[12px] leading-[1.35] text-white">Nickname: {itemValue.nickname}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSavedIdentity(itemValue.uid, itemValue.nickname)}
                          className="absolute right-2 top-2 text-[11px] text-white/60 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative z-0 rounded-[18px] border border-[#292929] bg-[#1c1c1c] px-5 py-5 before:absolute before:-inset-3 before:-z-10 before:rounded-[24px] before:bg-[#1c1c1c]">
                <h3 className="text-[20px] font-semibold leading-[1.2]">Buyurtma tavsilotlari</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex min-h-8 items-center justify-between text-[14px] leading-[1.45]">
                    <span className="text-[#d5d7da]">Maxsulot</span>
                    <span className="inline-flex items-center gap-2">
                      <img
                        src={currentPackage?.image ?? "/images/donate/pubg/pubg_60.png"}
                        alt=""
                        className="h-5 w-5 object-contain"
                      />
                      {isCurrentPackageReady ? `${formatDisplayNumber(Number(currentPackage?.amount ?? 0))} UC` : "Yuklanmoqda..."}
                    </span>
                  </div>
                  <div className="my-1 border-t border-dashed border-[#292929]" />
                  <div className="flex min-h-8 items-center justify-between leading-[1.45]">
                    <span className="text-[14px] font-semibold text-[#919eab]">Итого</span>
                    <span className="text-[16px] font-semibold">
                      {isCurrentPackageReady ? `${formatMoney(resolvePackagePrice(currentPackage))} UZS` : "Narxlar yuklanmoqda..."}
                    </span>
                  </div>
                </div>
                {!isCurrentPackageReady && (
                  <p className="mt-3 text-[12px] text-[#d5d7da]">
                    Paket va narxlar yangilanmoqda, bir necha soniyadan keyin davom eting.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handlePurchase()}
                disabled={createOrderMutation.isPending || !isCurrentPackageReady}
                className="mt-1 h-10 w-full rounded-xl bg-[#03ff93] text-[16px] font-semibold text-[#1a1b1f] transition hover:brightness-110 disabled:cursor-default disabled:opacity-60"
              >
                {createOrderMutation.isPending ? "Yuborilmoqda..." : "Sotib olish"}
              </button>
              </div>
              </div>
            </section>
          )}

          {donateId === "freefire" && freefireUidStep === "catalog" && (
            <section className="mt-8 flex min-w-0 flex-col gap-5 box-border">
              <div className="flex flex-col items-center gap-2">
                <img src={item.image} alt="Free Fire" className="h-8 w-auto object-contain" />
                <h2 className="text-center text-[30px] font-semibold leading-tight">{item.subtitle}</h2>
                <p className="text-center text-[16px] text-[#d5d7da]">Paketni tanlang</p>
              </div>

              <div className="grid min-w-0 grid-cols-2 gap-5 box-border sm:grid-cols-3 lg:grid-cols-4">
                {backendPackages.map((pkg, i) => (
                  <article
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!pkg.productId || createOrderMutation.isPending) return;
                      setSelectedIndex(i);
                      void handlePurchase(i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      if (!pkg.productId || createOrderMutation.isPending) return;
                      setSelectedIndex(i);
                      void handlePurchase(i);
                    }}
                    className="min-w-0 flex min-h-[260px] cursor-pointer flex-col items-center justify-start gap-4 rounded-2xl border border-[#2f352f] bg-[#121714]/90 p-5 box-border shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-[#03ff93]/70 hover:bg-[#17201b]"
                  >
                    <img src={pkg.image ?? item.image} alt={item.name} className="mx-auto h-[120px] w-[120px] object-contain" />
                    <p className="mt-4 whitespace-nowrap text-[30px] font-bold leading-none tracking-tight">
                      {typeof pkg.amount === "number" ? formatDisplayNumber(Number(pkg.amount)) : String(pkg.amount)}
                    </p>
                    <div className="mt-3 w-full border-t border-dashed border-[#425242]/80" />
                    <div className="mt-5 w-full min-w-0 box-border">
                      <p className="mt-2 text-center whitespace-nowrap text-[22px] font-semibold leading-none text-white/95">
                        {formatMoney(resolvePackagePrice(pkg))} so&apos;m
                      </p>
                    </div>
                  </article>
                ))}
              </div>

            </section>
          )}
          {donateId === "freefire" && freefireUidStep === "identity" && (
            <section className="relative z-10 mt-6 flex w-full min-w-0 items-start justify-center px-4 pb-10 box-border md:mt-0 md:pt-[70px]">
              <div className="flex w-full max-w-[920px] min-w-0 flex-col items-center justify-center rounded-[26px] border border-white/12 bg-black/55 px-6 py-10 shadow-[0_28px_90px_rgba(0,0,0,0.65)] backdrop-blur-xl box-border min-h-[520px] md:px-[100px] md:pt-[56px] md:pb-[38px]">
                <div className="mx-auto my-4 flex w-full max-w-[560px] min-w-0 flex-col gap-6 px-1 py-3">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img src={item.image} alt="Free Fire" className="h-[72px] w-auto rounded-xl object-contain" />
                    <h2 className="text-[24px] font-semibold leading-tight md:text-[32px]">UID orqali sotib olish</h2>
                    <p className="text-[14px] leading-[1.5] text-white/85">Sotib olish uchun Free Fire UID kiriting</p>
                  </div>

                  <input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Free Fire UID kiriting"
                    className="h-[58px] w-full rounded-xl border border-[#292929] bg-[#1c1c1c] pl-6 pr-4 text-[15px] leading-[1.35] text-white placeholder:text-[#8a8ea1] outline-none transition hover:border-[#3a3a3a] focus:border-[#03ff93]/60"
                    style={{ paddingLeft: "28px", paddingRight: "16px" }}
                  />

                  <div className="relative z-0 rounded-[18px] border border-[#292929] bg-[#1c1c1c] px-5 py-5 before:absolute before:-inset-3 before:-z-10 before:rounded-[24px] before:bg-[#1c1c1c]">
                    <h3 className="text-[20px] font-semibold leading-[1.2]">Buyurtma tavsilotlari</h3>
                    <div className="mt-4 space-y-4">
                      <div className="flex min-h-8 items-center justify-between text-[14px] leading-[1.45]">
                        <span className="text-[#d5d7da]">Maxsulot</span>
                        <span>
                          {typeof currentPackage?.amount === "number"
                            ? formatDisplayNumber(Number(currentPackage.amount))
                            : String(currentPackage?.amount ?? "-")}
                        </span>
                      </div>
                      <div className="my-1 border-t border-dashed border-[#292929]" />
                      <div className="flex min-h-8 items-center justify-between leading-[1.45]">
                        <span className="text-[14px] font-semibold text-[#919eab]">Итого</span>
                        <span className="text-[16px] font-semibold">
                          {isCurrentPackageReady ? `${formatMoney(resolvePackagePrice(currentPackage))} UZS` : "Narxlar yuklanmoqda..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handlePurchase(selectedIndex)}
                    disabled={createOrderMutation.isPending || !isCurrentPackageReady}
                    className="h-10 w-full rounded-xl bg-[#03ff93] text-[16px] font-semibold text-[#1a1b1f] transition hover:brightness-110 disabled:cursor-default disabled:opacity-60"
                  >
                    {createOrderMutation.isPending ? "Yuborilmoqda..." : "Sotib olish"}
                  </button>
                </div>
              </div>
            </section>
          )}
          {submitError && (
            <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-[13px] text-red-300">
              {submitError}
            </p>
          )}
        </main>
      </div>

      {freefireUidConfirmOpen && (
        <div className="fixed inset-0 z-[112] grid place-items-center bg-black/90 px-5 py-6 md:px-8">
          <div className="w-full max-w-[560px] min-w-0 rounded-2xl bg-transparent px-[20px] py-[28px] backdrop-blur-[2px]">
            <div
              className="flex min-w-0 flex-col gap-4 rounded-xl border border-white/15 bg-transparent text-center box-border"
              style={{ paddingTop: "20px", paddingBottom: "20px", paddingLeft: "20px", paddingRight: "20px" }}
            >
              <h3 className="text-[22px] font-semibold leading-tight text-white">Diqqat</h3>
              <p className="text-[15px] leading-[1.5] text-white/85">
                UID to&apos;g&apos;ri terganingizga ishonchingiz komilmi?
              </p>
              <p className="text-[16px] font-semibold text-[#f59e0b]">{userId.trim()}</p>

              <div className="mt-3 grid w-full min-w-0 grid-cols-2 gap-3 pb-1 box-border">
                <button
                  type="button"
                  onClick={() => setFreefireUidConfirmOpen(false)}
                  className="h-11 w-full min-w-0 rounded-xl border border-white/15 bg-white/5 text-[14px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white/85"
                >
                  Yo&apos;q, tahrirlash
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFreefireUidConfirmOpen(false);
                    setProviderModalOpen(true);
                  }}
                  className="h-11 w-full min-w-0 rounded-xl border border-[#03ff93]/35 bg-[#03ff93]/18 text-[14px] font-semibold text-[#cffff0] transition hover:bg-[#03ff93]/24"
                >
                  Ha, davom etish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isIframeOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4">
          <div className="mx-auto flex h-full w-full max-w-[900px] min-w-0 flex-col gap-3 rounded-2xl border border-white/15 bg-[#141414] p-3 box-border">
            <div className="grid min-h-[56px] grid-cols-[auto_1fr_auto] items-center rounded-xl border border-white/10 bg-[#1b1b1b] px-6 py-3">
              <button
                type="button"
                onClick={() => router.push("/profile/history")}
                className="justify-self-start h-10 rounded-md border border-white/20 bg-white/5 px-4 text-[13px] font-semibold text-white/90 transition hover:bg-white/10"
              >
                Tarixga o&apos;tish
              </button>
              <p className="text-center text-[15px] font-semibold tracking-[0.01em] text-white/90">OSON to&apos;lov tafsilotlari</p>
              <button
                type="button"
                onClick={() => setIsIframeOpen(false)}
                className="justify-self-end flex h-10 flex-col items-center justify-center rounded-md border border-white/20 bg-white/5 px-5 text-[14px] font-semibold text-white/90 transition hover:bg-white/10"
              >
                Yopish
              </button>
            </div>
            <iframe
              ref={iframeRef}
              src={paymentUrl}
              onLoad={handleIframeLoad}
              className="h-full min-h-0 w-full min-w-0 rounded-xl border border-white/10 bg-white"
              title="Oson Payment"
            />
            {paymentState === "error" && (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                To&apos;lov holatida xatolik ko&apos;rindi. Qayta tekshirib ko&apos;ring.
              </p>
            )}
          </div>
        </div>
      )}

      {providerModalOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/90 px-5 py-6 md:px-8">
          <div className="w-full max-w-[640px] min-w-0 max-h-[calc(100dvh-48px)] overflow-y-auto box-border rounded-2xl border border-white/10 bg-[#222326] px-5 pt-5 pb-8 md:px-6 md:pt-6 md:pb-9 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="mb-4 flex w-full min-w-0 box-border flex-col items-center gap-4 rounded-xl border border-white/10 bg-[#26282e] px-4 pt-4 pb-6 md:px-4 md:pt-4 md:pb-6">
              <div className="mx-auto flex w-full max-w-[560px] min-w-0 box-border flex-col items-center px-5 py-6 text-center md:px-6 md:py-7">
              <img
                src="https://www.figma.com/api/mcp/asset/c5aa4559-0694-4fd2-aa8d-4de4642da30b"
                alt=""
                className="h-20 w-20 md:h-24 md:w-24"
              />
              <h3 className="mt-4 text-[22px] font-semibold leading-tight text-white">
                To&apos;lov usulini tanlang
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-[#d5d7da]">
                Quyidagi to&apos;lov usullaridan birini tanlang
              </p>
            </div>

            <div className="mx-auto grid w-full max-w-[560px] min-w-0 box-border gap-3 p-4">
              <button
                type="button"
                onClick={() => setPaymentProvider("OSON")}
                style={{ paddingLeft: 24, paddingRight: 20, paddingTop: 16, paddingBottom: 16 }}
                className={`w-full min-h-[82px] min-w-0 box-border rounded-xl border py-4 pl-6 pr-5 text-left backdrop-blur-[10px] shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.09] hover:shadow-[0_16px_36px_rgba(0,0,0,0.34)] ${
                  paymentProvider === "OSON"
                    ? "border-[#03ff93] bg-white/[0.14]"
                    : "border-white/15 bg-white/[0.05]"
                }`}
              >
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[20px] font-extrabold leading-6 tracking-wide text-white">
                      OSON
                    </p>
                    <p className="mt-1 text-[13px] leading-5 text-[#d5d7da]">Humo / Uzcard</p>
                  </div>
                  <span className="shrink-0 text-[18px] leading-none text-[#03ff93]">
                    {paymentProvider === "OSON" ? "●" : "○"}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentProvider("OCTO")}
                style={{ paddingLeft: 24, paddingRight: 20, paddingTop: 16, paddingBottom: 16 }}
                className={`w-full min-h-[82px] min-w-0 box-border rounded-xl border py-4 pl-6 pr-5 text-left backdrop-blur-[10px] shadow-[0_10px_26px_rgba(0,0,0,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.09] hover:shadow-[0_16px_36px_rgba(0,0,0,0.34)] ${
                  paymentProvider === "OCTO"
                    ? "border-[#03ff93] bg-white/[0.14]"
                    : "border-white/15 bg-white/[0.05]"
                }`}
              >
                <div className="flex min-w-0 items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-[20px] font-extrabold leading-6 tracking-wide text-white">
                      OCTOBANK
                    </p>
                    <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                      <span className="inline-flex h-5 shrink-0 items-center rounded-md border border-white/20 px-1.5 text-[10px] font-bold tracking-wide text-white">
                        VISA
                      </span>
                      <span className="inline-flex shrink-0 items-center">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#eb001b]/90" />
                        <span className="-ml-1.5 h-3.5 w-3.5 rounded-full bg-[#f79e1b]/90" />
                      </span>
                      <p className="min-w-0 text-[13px] leading-5 text-[#d5d7da]">
                        Visa / Mastercard
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[18px] leading-none text-[#03ff93]">
                    {paymentProvider === "OCTO" ? "●" : "○"}
                  </span>
                </div>
              </button>
            </div>

            <div className="mx-auto mt-4 grid w-full max-w-[560px] min-w-0 box-border grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProviderModalOpen(false)}
                className="h-12 md:h-[52px] rounded-xl border border-[#292929] bg-[#1c1c1c] px-4 md:px-5 text-[16px] text-[#d5d7da]"
              >
                Ortga
              </button>
              <button
                type="button"
                onClick={() => void confirmPaymentProvider()}
                disabled={createOrderMutation.isPending}
                className="h-12 md:h-[52px] rounded-xl bg-[#03ff93] px-4 md:px-5 text-[16px] font-semibold text-[#1a1b1f] disabled:opacity-60"
              >
                {createOrderMutation.isPending ? "Yuborilmoqda..." : "Tasdiqlash"}
              </button>
            </div>
            <div className="h-3 w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
