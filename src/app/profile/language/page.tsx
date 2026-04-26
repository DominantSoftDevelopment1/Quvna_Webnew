"use client";

import { ChevronLeft, Globe, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const LANGUAGE_OPTIONS = [
  { id: "uz", label: "O'zbek tili" },
  { id: "ru", label: "Русский" },
  { id: "en", label: "English" },
  { id: "uk", label: "Українська" },
];

export default function ProfileLanguagePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("uz");

  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGE_OPTIONS;
    return LANGUAGE_OPTIONS.filter((item) => item.label.toLowerCase().includes(q));
  }, [query]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0b0d0e",
        color: "#fff",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          padding: "12px 16px calc(24px + env(safe-area-inset-bottom))",
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
            paddingBottom: 8,
            marginBottom: 6,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "32px 1fr 32px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <button
              type="button"
              aria-label="Orqaga"
              onClick={() => router.back()}
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
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Til</h1>
            <span />
          </div>
        </header>

        <div
          style={{
            width: "100%",
            height: 40,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 12px",
            boxSizing: "border-box",
            marginBottom: 8,
          }}
        >
          <Search size={16} color="rgba(255,255,255,0.35)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: "#fff",
              width: "100%",
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {filteredLanguages.map((lang) => {
            const isSelected = selected === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelected(lang.id)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  height: 40,
                  padding: "0 2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <Globe size={16} color="rgba(255,255,255,0.55)" />
                  <span style={{ fontSize: 18, fontWeight: 400 }}>{lang.label}</span>
                </div>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    border: `1px solid ${isSelected ? "#00f2a9" : "rgba(255,255,255,0.28)"}`,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                  }}
                >
                  {isSelected ? <span style={{ width: 8, height: 8, borderRadius: 999, background: "#00f2a9" }} /> : null}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            marginTop: 18,
            width: "100%",
            height: 40,
            border: "none",
            borderRadius: 10,
            background: "#00f092",
            color: "#fff",
            fontSize: 18,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}

