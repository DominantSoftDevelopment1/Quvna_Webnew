"use client";

import { Bell, ChevronLeft, ChevronRight, KeyRound, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type SettingsItem = {
  href: string;
  title: string;
  icon: ReactNode;
};

const ITEMS: SettingsItem[] = [
  { href: "/profile/settings/notifications", title: "Bildirishnomalar", icon: <Bell size={16} color="#00f092" /> },
  { href: "/profile/settings/change-password", title: "Parolni o'zgartirish", icon: <KeyRound size={16} color="#00f092" /> },
  { href: "/profile/settings/change-email", title: "Email o'zgartirish", icon: <Mail size={16} color="#00f092" /> },
  { href: "/profile/settings/change-phone", title: "Telefon raqam o'zgartirish", icon: <Phone size={16} color="#00f092" /> },
];

export default function ProfileSettingsPage() {
  const router = useRouter();

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
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#0b0d0e",
            paddingTop: 4,
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
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
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Sozlamalar</h1>
            <span />
          </div>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                width: "100%",
                minHeight: 52,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.03)",
                color: "#fff",
                textDecoration: "none",
                boxSizing: "border-box",
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                {item.icon}
                <span style={{ fontSize: 14, lineHeight: "20px" }}>{item.title}</span>
              </span>
              <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

