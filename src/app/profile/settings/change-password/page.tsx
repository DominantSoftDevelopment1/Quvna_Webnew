"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import type { CSSProperties } from "react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Barcha maydonlarni to'ldiring.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Yangi parollar mos emas.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Yangi parol kamida 6 belgidan iborat bo'lishi kerak.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/api/auth/v2/change-password", {
        currentPassword,
        newPassword,
      });
      setSuccess("Parol muvaffaqiyatli yangilandi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(message === "Incorrect password" ? "Joriy parol noto'g'ri." : "Parolni yangilab bo'lmadi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#0b0d0e", color: "#fff", width: "100%" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          padding: "12px 16px calc(20px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        <header style={{ paddingTop: 4, paddingBottom: 10, marginBottom: 10 }}>
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
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Parolni o'zgartirish</h1>
            <span />
          </div>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <h2 style={{ margin: "22px 0 6px", fontSize: 28, lineHeight: "34px", textAlign: "center", fontWeight: 500 }}>Yangi parolni kiriting</h2>
          <p style={{ margin: 0, textAlign: "center", fontSize: 14, lineHeight: "22px", color: "rgba(255,255,255,0.68)" }}>
            Parolni kiriting va qayta kiriting
          </p>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              placeholder="Joriy parolni kiriting"
              style={inputStyle}
            />
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Yangi parolni kiriting" style={inputStyle} />
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Yangi parolni tasdiqlang"
              style={inputStyle}
            />
          </div>

          {error ? <p style={{ margin: "10px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}
          {success ? <p style={{ margin: "10px 0 0", color: "#86efac", fontSize: 13 }}>{success}</p> : null}

          <div style={{ marginTop: 16, paddingTop: 4 }}>
            <button type="submit" disabled={isLoading} style={saveButtonStyle}>
              {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Parolni saqlash
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  outline: "none",
  padding: "10px 12px",
  boxSizing: "border-box",
  fontSize: 14,
};

const saveButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 10,
  border: "none",
  background: "#1ce58b",
  color: "#03120b",
  fontSize: 14,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
};

