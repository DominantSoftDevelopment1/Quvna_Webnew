"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";

type Step = "phone" | "otp" | "info";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("phone");

  // Step 1
  const [phoneNumber, setPhoneNumber] = useState("");
  // Step 2
  const [otp, setOtp] = useState("");
  // Step 3
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();

  function setField(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // Step 1 — telefon raqam yuborish, SMS kod olish
  async function handleSendSms(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post(`/api/auth/sms?phoneNumber=${encodeURIComponent(phoneNumber)}&isForgot=false`, { phoneNumber });
      setStep("otp");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { msg: string }[] } } })
        ?.response?.data?.errors?.[0]?.msg;
      setError(msg ?? "SMS yuborishda xatolik. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — OTP tekshirish
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/v2/check-otp", { phoneNumber, code: otp });
      setStep("info");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { msg: string }[] } } })
        ?.response?.data?.errors?.[0]?.msg;
      setError(msg ?? "Kod noto'g'ri. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 — ro'yxatdan o'tish
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Parollar mos emas");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/v2/register", {
        phoneNumber,
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
      });
      const d = data?.data;
      // After register, auto-login
      const loginRes = await api.post("/api/auth/login", { phoneNumber, password: form.password });
      const ld = loginRes.data?.data;
      if (ld?.accessToken) {
        setTokens(ld.accessToken, ld.refreshToken);
        localStorage.setItem("userId", String(ld.users?.id ?? ""));
        if (ld.users) setUser(ld.users);
        router.push("/");
      } else if (d) {
        router.push("/auth/login");
      } else {
        setError("Ro'yxatdan o'tishda xatolik");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { msg: string }[] } } })
        ?.response?.data?.errors?.[0]?.msg;
      setError(msg ?? "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3.5 rounded-xl text-base outline-none focus:ring-2";
  const inputStyle = { background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" };
  const labelStyle = { color: "var(--text-secondary)" };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center" style={{ marginBottom: 16 }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: "var(--primary)", marginBottom: 16 }}
          >
            Q
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Quvnaga qo'shiling</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {step === "phone" && "Telefon raqamingizni kiriting"}
            {step === "otp" && "SMS kodni kiriting"}
            {step === "info" && "Ma'lumotlaringizni kiriting"}
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          {(["phone", "otp", "info"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: step === s ? "var(--primary)" : (["phone","otp","info"].indexOf(step) > i ? "var(--primary)" : "var(--bg-card)"),
                  color: step === s || ["phone","otp","info"].indexOf(step) > i ? "#000" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="h-px flex-1" style={{ background: "var(--border)" }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Phone */}
        {step === "phone" && (
          <form onSubmit={handleSendSms} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="block text-base font-medium mb-2" style={labelStyle}>Telefon raqam</label>
              <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998901234567" required className={inputClass} style={inputStyle} />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "var(--primary)", color: "#000" }}>
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "SMS kod yuborish"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
              <span style={{ color: "var(--text-primary)" }}>{phoneNumber}</span> raqamiga SMS kod yuborildi
            </p>
            <div>
              <label className="block text-base font-medium mb-2" style={labelStyle}>SMS kod</label>
              <input type="text" inputMode="numeric" value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456" maxLength={6} required
                className={inputClass + " text-center text-xl tracking-widest"} style={inputStyle} />
            </div>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "var(--primary)", color: "#000" }}>
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "Tasdiqlash"}
            </button>
            <button type="button" onClick={() => { setStep("phone"); setError(""); }} className="w-full flex items-center justify-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
              <ArrowLeft size={16} /> Orqaga
            </button>
          </form>
        )}

        {/* Step 3: Info */}
        {step === "info" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "firstName", label: "Ism", placeholder: "Ismoil" },
              { key: "lastName", label: "Familiya", placeholder: "Karimov" },
              { key: "email", label: "Email (ixtiyoriy)", placeholder: "email@example.com", required: false },
            ].map(({ key, label, placeholder, required: req = true }) => (
              <div key={key}>
                <label className="block text-base font-medium mb-2" style={labelStyle}>{label}</label>
                <input type={key === "email" ? "email" : "text"} value={form[key as keyof typeof form]}
                  onChange={(e) => setField(key, e.target.value)} placeholder={placeholder}
                  required={req} className={inputClass} style={inputStyle} />
              </div>
            ))}

            {[
              { key: "password", label: "Parol" },
              { key: "confirmPassword", label: "Parolni tasdiqlang" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-base font-medium mb-2" style={labelStyle}>{label}</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form[key as keyof typeof form]}
                    onChange={(e) => setField(key, e.target.value)} placeholder="••••••••" required
                    className={inputClass + " pr-12"} style={inputStyle} />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            ))}

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "var(--primary)", color: "#000" }}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18} /> Ro'yxatdan o'tish</>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm" style={{ color: "var(--text-muted)", marginTop: 16 }}>
          Hisobingiz bormi?{" "}
          <Link href="/auth/login" style={{ color: "var(--primary)" }} className="font-medium">Kirish</Link>
        </p>
      </div>
    </div>
  );
}
