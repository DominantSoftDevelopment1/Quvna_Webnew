"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function ChangePhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!phone.trim()) {
      setError("Telefon raqamini kiriting.");
      return;
    }
    try {
      setIsLoading(true);
      await api.put("/api/auth/edit/phone-number", { phone: phone.trim() });
      setStep("otp");
      setSuccess("Kod telefon raqamingizga yuborildi.");
    } catch {
      setError("Telefon raqamni o'zgartirishni boshlab bo'lmadi.");
    } finally {
      setIsLoading(false);
    }
  }

  async function confirmCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!otpCode.trim()) {
      setError("Tasdiqlash kodini kiriting.");
      return;
    }
    try {
      setIsLoading(true);
      await api.post("/api/auth/check-edit/otp-login", { code: otpCode.trim() });
      setSuccess("Telefon raqam muvaffaqiyatli o'zgartirildi.");
      setTimeout(() => router.back(), 700);
    } catch {
      setError("Kod noto'g'ri yoki muddati tugagan.");
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCode() {
    setError(null);
    setSuccess(null);
    try {
      setIsLoading(true);
      await api.put("/api/auth/edit/phone-number", { phone: phone.trim() });
      setSuccess("Kod qayta yuborildi.");
    } catch {
      setError("Kodni qayta yuborib bo'lmadi.");
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
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Telefon raqamni o'zgartirish</h1>
            <span />
          </div>
        </header>

        {step === "form" ? (
          <form onSubmit={sendCode} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <h2 style={{ margin: "22px 0 6px", fontSize: 32, lineHeight: "36px", textAlign: "center", fontWeight: 500 }}>Yangi telefon raqamingizni kiriting</h2>
            <p style={{ margin: 0, textAlign: "center", fontSize: 14, lineHeight: "22px", color: "rgba(255,255,255,0.68)" }}>
              Telefon raqamingizni o'zgartirish uchun yangi telefon raqamingizni kiriting.
            </p>

            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon raqamingizni kiriting" inputMode="tel" style={{ ...inputStyle, marginTop: 18 }} />

            {error ? <p style={{ margin: "10px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}
            {success ? <p style={{ margin: "10px 0 0", color: "#86efac", fontSize: 13 }}>{success}</p> : null}

            <div style={{ marginTop: 16, paddingTop: 4 }}>
              <button type="submit" disabled={isLoading} style={primaryButtonStyle}>
                {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                Yuborish
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={confirmCode} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <h2 style={{ margin: "22px 0 6px", fontSize: 32, lineHeight: "36px", textAlign: "center", fontWeight: 500 }}>Tasdiqlash</h2>
            <p style={{ margin: 0, textAlign: "center", fontSize: 14, lineHeight: "22px", color: "rgba(255,255,255,0.68)" }}>
              Iltimos, sizning {phone} raqamingizga yuborilgan kodni kiriting.
            </p>

            <input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="Kod" inputMode="numeric" maxLength={6} style={{ ...inputStyle, marginTop: 18, textAlign: "center", letterSpacing: 4 }} />

            {error ? <p style={{ margin: "10px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}
            {success ? <p style={{ margin: "10px 0 0", color: "#86efac", fontSize: 13 }}>{success}</p> : null}

            <div style={{ marginTop: 16, paddingTop: 4, display: "flex", flexDirection: "column", gap: 10 }}>
              <button type="submit" disabled={isLoading} style={primaryButtonStyle}>
                {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                Tasdiqlash
              </button>
              <button type="button" disabled={isLoading} onClick={resendCode} style={secondaryButtonStyle}>
                Qayta yuborish
              </button>
            </div>
          </form>
        )}
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

const inputStyle = {
  width: "100%",
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  outline: "none",
  padding: "10px 12px",
  boxSizing: "border-box" as const,
  fontSize: 14,
};

const primaryButtonStyle = {
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

const secondaryButtonStyle = {
  width: "100%",
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.9)",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

