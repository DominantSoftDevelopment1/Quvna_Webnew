"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

type ProductType = "UC" | "MOBILE_LEGENDS" | "FREE_FIRE" | "STEAM";

type HistoryItem = {
  id?: number | string;
  orderStatus?: string | null;
  totalPrice?: number | string | null;
  createdAt?: string | null;
  playerId?: string | null;
  playerName?: string | null;
  receiver?: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  gift_code?: string | null;
  payType?: string | null;
  isCupon?: boolean | null;
  productResponseDTOS?: Array<{ totalAmount?: number | string | null } | null> | null;
};

type TabState = {
  items: HistoryItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  initialized: boolean;
};

const PAGE_SIZE = 10;

const TAB_CONFIG: Array<{ key: ProductType; label: string; amountName: string; productName: string; icon: string }> = [
  { key: "UC", label: "PUBG", amountName: "UC", productName: "PUBG MOBILE", icon: "/images/donate_pubg.png" },
  { key: "MOBILE_LEGENDS", label: "ML", amountName: "almaz", productName: "MOBILE LEGENDS", icon: "/images/donate_mobile_legends.png" },
  { key: "FREE_FIRE", label: "FF", amountName: "almaz", productName: "FREE FIRE", icon: "/images/donate_free_fire.png" },
  { key: "STEAM", label: "STEAM", amountName: "", productName: "STEAM", icon: "/images/donate_steam.png" },
];

const EMPTY_TAB_STATE: TabState = {
  items: [],
  page: -1,
  hasMore: true,
  loading: false,
  initialized: false,
};

function statusLabel(status?: string | null): { text: string; bg: string; color: string } {
  const normalized = String(status ?? "").toUpperCase();
  if (normalized.includes("SUCCESS")) return { text: "Muvaffaqiyatli", bg: "rgba(16,185,129,0.16)", color: "#34d399" };
  if (normalized.includes("PENDING")) return { text: "Jarayonda", bg: "rgba(245,158,11,0.16)", color: "#fbbf24" };
  if (normalized.includes("CANCEL")) return { text: "Bekor qilingan", bg: "rgba(239,68,68,0.16)", color: "#f87171" };
  if (normalized.includes("FAIL")) return { text: "Xatolik", bg: "rgba(239,68,68,0.16)", color: "#f87171" };
  return { text: "Noma'lum", bg: "rgba(148,163,184,0.18)", color: "#cbd5e1" };
}

function dateGroupLabel(value?: string | null): string {
  if (!value) return "Noma'lum sana";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Noma'lum sana";
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((current - target) / 86400000);
  const fullDate = date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    weekday: "short",
  });
  if (diffDays === 0) return `Bugun • ${fullDate}`;
  if (diffDays === 1) return `Kecha • ${fullDate}`;
  return fullDate;
}

function timeLabel(value?: string | null): string {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function exactDateTimeLabel(value?: string | null): string {
  if (!value) return "Noma'lum";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Noma'lum";
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gameBackground(type: ProductType): string {
  if (type === "UC") return "radial-gradient(120% 100% at 10% 0%, #1e3a8a 0%, #0f172a 55%, #020617 100%)";
  if (type === "MOBILE_LEGENDS") return "radial-gradient(120% 100% at 15% 0%, #312e81 0%, #111827 55%, #020617 100%)";
  if (type === "FREE_FIRE") return "radial-gradient(120% 100% at 20% 0%, #7c2d12 0%, #1f2937 55%, #020617 100%)";
  return "radial-gradient(120% 100% at 15% 0%, #0b3b55 0%, #111827 50%, #020617 100%)";
}

export default function ProfileHistoryPage() {
  const { user } = useAuthStore();
  const userId = user?.id ? Number(user.id) : null;
  const [activeTab, setActiveTab] = useState<ProductType>("UC");
  const [error, setError] = useState<string | null>(null);
  const [stateByTab, setStateByTab] = useState<Record<ProductType, TabState>>({
    UC: { ...EMPTY_TAB_STATE },
    MOBILE_LEGENDS: { ...EMPTY_TAB_STATE },
    FREE_FIRE: { ...EMPTY_TAB_STATE },
    STEAM: { ...EMPTY_TAB_STATE },
  });
  const [selectedReceipt, setSelectedReceipt] = useState<{ item: HistoryItem; tab: ProductType } | null>(null);

  const activeState = stateByTab[activeTab];
  const activeConfig = TAB_CONFIG.find((tab) => tab.key === activeTab) ?? TAB_CONFIG[0];

  async function loadTab(tab: ProductType, firstLoad: boolean) {
    if (!userId) return;
    const currentState = stateByTab[tab];
    if (currentState.loading) return;
    if (!firstLoad && !currentState.hasMore) return;
    if (firstLoad && currentState.initialized) return;

    const nextPage = firstLoad ? 0 : currentState.page + 1;
    setStateByTab((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], loading: true },
    }));

    try {
      setError(null);
      const { data } = await api.get(`/order/list/V2/${userId}`, {
        params: { page: nextPage, size: PAGE_SIZE, productType: tab },
      });
      const raw = Array.isArray(data?.data) ? data.data : [];
      setStateByTab((prev) => ({
        ...prev,
        [tab]: {
          items: firstLoad ? raw : [...prev[tab].items, ...raw],
          page: nextPage,
          hasMore: raw.length > 0,
          loading: false,
          initialized: true,
        },
      }));
    } catch {
      setStateByTab((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], loading: false },
      }));
      setError("Tarixni yuklab bo'lmadi.");
    }
  }

  useEffect(() => {
    void loadTab(activeTab, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, userId]);

  const grouped = useMemo(() => {
    const map = new Map<string, HistoryItem[]>();
    for (const item of activeState.items) {
      const key = dateGroupLabel(item.createdAt);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
  }, [activeState.items]);

  return (
    <div style={{ minHeight: "calc(100dvh - 56px)", width: "100%", background: gameBackground(activeTab), color: "#fff" }}>
      <div style={{ width: "100%", minHeight: "calc(100dvh - 56px)", maxWidth: 430, margin: "0 auto", padding: "12px 10px calc(18px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr 32px",
            alignItems: "center",
            marginBottom: 12,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(14,19,28,0.52)",
            backdropFilter: "blur(12px)",
            padding: "8px 10px",
          }}
        >
          <Link href="/profile" aria-label="Orqaga" style={{ width: 32, height: 32, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "rgba(226,232,240,0.92)", background: "rgba(255,255,255,0.06)" }}>
            <ChevronLeft size={20} />
          </Link>
          <h1 style={{ margin: 0, textAlign: "center", fontSize: 21, fontWeight: 600, color: "rgba(255,255,255,0.95)" }}>Tarix</h1>
          <div />
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8, marginBottom: 12, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(10,14,22,0.42)", backdropFilter: "blur(8px)", padding: 8 }}>
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                minHeight: 36,
                borderRadius: 10,
                border: activeTab === tab.key ? "1px solid rgba(255,255,255,0.32)" : "1px solid rgba(255,255,255,0.08)",
                background: activeTab === tab.key ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.9)",
                fontSize: 12,
                fontWeight: activeTab === tab.key ? 700 : 600,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? <p style={{ margin: "0 0 10px", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}

        {!activeState.loading && activeState.items.length === 0 ? (
          <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(17,24,39,0.52)", backdropFilter: "blur(16px)", padding: "22px 14px", textAlign: "center" }}>
            <img src="/icons/gamepad.svg" alt="" width={68} height={68} style={{ opacity: 0.82 }} />
            <p style={{ margin: "12px 0 6px", fontSize: 18, color: "#fff", fontWeight: 600 }}>Hozircha xarid tarixi yo&apos;q</p>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.62)" }}>Xarid qilganingizdan keyin tarix shu yerda ko&apos;rinadi.</p>
            <Link href="/donate" style={{ marginTop: 12, minHeight: 38, borderRadius: 10, padding: "0 14px", border: "none", background: "#18ef97", color: "#032515", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              Xarid qilish
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {grouped.map((group) => (
              <section key={group.title}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ display: "inline-flex", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(148,163,184,0.26)", color: "rgba(255,255,255,0.95)", padding: "5px 11px", fontSize: 11, fontWeight: 600, letterSpacing: 0.2, backdropFilter: "blur(8px)" }}>
                    {group.title}
                  </div>
                </div>
                <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                  {group.items.map((item, idx) => {
                    const amount = item.productResponseDTOS?.[0]?.totalAmount ?? "";
                    const status = statusLabel(item.orderStatus);
                    return (
                      <button
                        key={`${item.id ?? "row"}-${idx}`}
                        type="button"
                        onClick={() => setSelectedReceipt({ item, tab: activeTab })}
                        style={{
                          width: "100%",
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(15,23,42,0.62)",
                          backdropFilter: "blur(12px)",
                          boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                          padding: "11px 10px",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", gap: 8, alignItems: "center" }}>
                          <img src={activeConfig.icon} alt="" width={36} height={36} style={{ borderRadius: 10, objectFit: "cover", border: "1px solid rgba(255,255,255,0.24)" }} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {amount} {activeConfig.amountName}
                            </p>
                            <div style={{ marginTop: 4, display: "inline-flex", borderRadius: 999, padding: "2px 7px", fontSize: 10, fontWeight: 700, color: status.color, background: status.bg }}>
                              {status.text}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{Number(item.totalPrice ?? 0).toLocaleString()} so&apos;m</p>
                            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{timeLabel(item.createdAt)}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.52)" }}>{exactDateTimeLabel(item.createdAt)}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeState.loading ? (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} style={{ height: 58, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }} />
            ))}
          </div>
        ) : null}

        {!activeState.loading && activeState.hasMore && activeState.items.length > 0 ? (
          <button
            type="button"
            onClick={() => void loadTab(activeTab, false)}
            style={{ marginTop: 12, width: "100%", minHeight: 42, borderRadius: 14, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.96)", fontSize: 14, fontWeight: 600, cursor: "pointer", backdropFilter: "blur(8px)" }}
          >
            Yana yuklash
          </button>
        ) : null}
      </div>
      {selectedReceipt ? (
        <ReceiptModal
          item={selectedReceipt.item}
          tab={selectedReceipt.tab}
          onClose={() => setSelectedReceipt(null)}
        />
      ) : null}
    </div>
  );
}

function ReceiptModal({ item, tab, onClose }: { item: HistoryItem; tab: ProductType; onClose: () => void }) {
  const config = TAB_CONFIG.find((t) => t.key === tab) ?? TAB_CONFIG[0];
  const status = statusLabel(item.orderStatus);
  const amount = item.productResponseDTOS?.[0]?.totalAmount ?? "";
  const isUcCouponReceipt = tab === "UC" && Boolean(item.isCupon || item.gift_code);
  const [copied, setCopied] = useState(false);
  const nickname = item.playerName || item.receiver || item.fullName || "-";
  const identityLabel = tab === "STEAM" ? "Login" : "UID";
  const identityValue = item.playerId || item.receiver || "-";
  const voucherCode = item.gift_code || "-";

  async function handleCopyVoucher() {
    if (!voucherCode || voucherCode === "-") return;
    try {
      await navigator.clipboard.writeText(voucherCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API blocked or unavailable; silently ignore.
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(2,6,12,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          maxHeight: "92dvh",
          overflowY: "auto",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(180deg, rgba(17,25,39,0.9), rgba(11,16,28,0.9))",
          backdropFilter: "blur(18px)",
          boxShadow: "0 24px 48px rgba(0,0,0,0.45)",
          padding: "12px 12px 14px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.34)", margin: "0 auto 10px" }} />
        <h3 style={{ margin: "0 0 12px", textAlign: "center", fontSize: 18, fontWeight: 700 }}>
          {isUcCouponReceipt ? "To'lov cheki - Voucher" : "To'lov cheki"}
        </h3>

        <div style={{ textAlign: "center" }}>
          <img src={config.icon} alt="" width={74} height={74} style={{ borderRadius: 18, objectFit: "cover", border: "1px solid rgba(255,255,255,0.24)" }} />
          <p style={{ margin: "10px 0 0", fontSize: 18, fontWeight: 700 }}>{amount} {config.amountName}</p>
          <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 800 }}>{Number(item.totalPrice ?? 0).toLocaleString()} so'm</p>
          <div style={{ marginTop: 8, display: "inline-flex", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: status.color, background: status.bg }}>
            {status.text}
          </div>
        </div>

        <div style={{ marginTop: 12, borderRadius: 16, border: "1px solid rgba(255,255,255,0.14)", background: "rgba(30,41,59,0.54)", backdropFilter: "blur(10px)", padding: 10, display: "grid", gap: 8 }}>
          <Row label="Maxsulot" value={config.productName} />
          <Row label="Sana vaqti" value={`${dateGroupLabel(item.createdAt)}, ${timeLabel(item.createdAt)}`} />
          {isUcCouponReceipt ? (
            <>
              <Row
                label="Voucher kodi"
                value={voucherCode}
                action={
                  <button
                    type="button"
                    onClick={handleCopyVoucher}
                    disabled={!voucherCode || voucherCode === "-"}
                    style={{
                      marginTop: 6,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.22)",
                      background: copied ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.92)",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 8px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      cursor: !voucherCode || voucherCode === "-" ? "not-allowed" : "pointer",
                      opacity: !voucherCode || voucherCode === "-" ? 0.5 : 1,
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Nusxalandi" : "Nusxalash"}
                  </button>
                }
              />
              <Row label="To'lov turi" value={item.payType || "Coupon"} />
              <Row label="Qabul qiluvchi" value={item.fullName || "-"} isLast />
            </>
          ) : (
            <>
              <Row label="Nickname" value={nickname} />
              <Row label={identityLabel} value={identityValue} />
              <Row label="Telefon" value={item.phoneNumber || "-"} isLast />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, action, isLast }: { label: string; value: string; action?: React.ReactNode; isLast?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: 8,
        paddingBottom: isLast ? 0 : 8,
        borderBottom: isLast ? "none" : "1px dashed rgba(255,255,255,0.2)",
      }}
    >
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.62)" }}>{label}</p>
      <div>
        <p style={{ margin: 0, fontSize: 13, color: "#fff", fontWeight: 600, wordBreak: "break-word" }}>{value}</p>
        {action}
      </div>
    </div>
  );
}

