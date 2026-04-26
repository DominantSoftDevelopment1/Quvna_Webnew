"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

export function ClubShell({
  title,
  right,
  children,
  onHeaderBack,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  onHeaderBack?: () => void;
}) {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100dvh", background: "#0b0d0e", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", padding: "12px 10px calc(16px + env(safe-area-inset-bottom))", boxSizing: "border-box" }}>
        <header style={{ display: "grid", gridTemplateColumns: "32px 1fr 32px", alignItems: "center", marginBottom: 10 }}>
          <button type="button" onClick={onHeaderBack ?? (() => router.back())} style={backBtnStyle} aria-label="Orqaga">
            <ChevronLeft size={20} />
          </button>
          <h1 style={{ margin: 0, textAlign: "center", fontSize: 21, fontWeight: 500, color: "rgba(255,255,255,0.86)" }}>{title}</h1>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>{right}</div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function StepProgress({ current }: { current: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6, marginBottom: 14 }}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height: 6,
            borderRadius: 999,
            background: idx < current ? "#19f39a" : "rgba(255,255,255,0.14)",
          }}
        />
      ))}
    </div>
  );
}

export function BottomActions({
  onBack,
  onNext,
  nextText = "Keyingi",
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextText?: string;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        width: "min(430px, calc(100% - 20px))",
        margin: "200px auto",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        padding: "10px 20px",
      }}
    >
      <button type="button" onClick={onBack} style={secondaryBtnStyle}>
        Ortga
      </button>
      <button type="button" onClick={onNext} disabled={disabled} style={{ ...primaryBtnStyle, opacity: disabled ? 0.5 : 1 }}>
        {nextText}
      </button>
    </div>
  );
}

export const cardInputStyle: CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#1b1d23",
  color: "#fff",
  boxSizing: "border-box",
  padding: "11px 12px",
  outline: "none",
  fontSize: 14,
};

const backBtnStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 999,
  border: "none",
  background: "transparent",
  color: "rgba(180,185,195,0.9)",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const secondaryBtnStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.82)",
  fontSize: 15,
  cursor: "pointer",
};

const primaryBtnStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "none",
  background: "#18ef97",
  color: "#032515",
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

