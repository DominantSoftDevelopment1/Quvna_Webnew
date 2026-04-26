"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  enabled: boolean;
};

const INITIAL_ITEMS: NotificationItem[] = [
  { id: "stream", title: "Efir haqida bildirishnoma", desc: "Efir boshlanganda sizga bildirishnoma keladi.", enabled: true },
  { id: "post", title: "Post haqida bildirishnoma", desc: "Post joylanganda sizga bildirishnoma keladi.", enabled: false },
  { id: "news1", title: "Yangi habar kelganida", desc: "Post joylanganda sizga bildirishnoma keladi.", enabled: false },
  { id: "news2", title: "Yangi habar kelganida", desc: "Post joylanganda sizga bildirishnoma keladi.", enabled: true },
  { id: "post2", title: "Post haqida bildirishnoma", desc: "Post joylanganda sizga bildirishnoma keladi.", enabled: true },
  { id: "news3", title: "Yangi habar kelganida", desc: "Post joylanganda sizga bildirishnoma keladi.", enabled: false },
  { id: "news4", title: "Yangi habar kelganida", desc: "Post joylanganda sizga bildirishnoma keladi.", enabled: false },
];

function Switch({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Bildirishnomani yoqish yoki o'chirish"
      style={{
        width: 34,
        height: 20,
        borderRadius: 999,
        border: "none",
        background: checked ? "#1ce58b" : "rgba(255,255,255,0.25)",
        padding: 2,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: checked ? "flex-end" : "flex-start",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 999, background: "#fff", display: "block" }} />
    </button>
  );
}

export default function ProfileSettingsNotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(INITIAL_ITEMS);

  const cards = useMemo(
    () =>
      items.map((item) => (
        <section
          key={item.id}
          style={{
            width: "100%",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.03)",
            boxSizing: "border-box",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>{item.title}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, lineHeight: "16px", color: "rgba(255,255,255,0.65)" }}>{item.desc}</p>
          </div>
          <Switch
            checked={item.enabled}
            onToggle={() =>
              setItems((prev) => prev.map((oldItem) => (oldItem.id === item.id ? { ...oldItem, enabled: !oldItem.enabled } : oldItem)))
            }
          />
        </section>
      )),
    [items],
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#0b0d0e", color: "#fff", width: "100%" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          padding: "12px 16px calc(20px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
        }}
      >
        <header style={{ position: "sticky", top: 0, background: "#0b0d0e", zIndex: 10, paddingTop: 4, paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 32px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Orqaga"
              style={{
                width: 32,
                height: 32,
                border: "none",
                background: "transparent",
                color: "#8b8f96",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 999,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Bildirishnomalar</h1>
            <span />
          </div>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{cards}</div>
      </div>
    </div>
  );
}

