"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cleanPhone = phoneNumber.replace(/[\s\-().]/g, "");
      const { data } = await api.post("/api/auth/login", { phoneNumber: cleanPhone, password });
      const d = data?.data;
      if (d?.accessToken) {
        setTokens(d.accessToken, d.refreshToken);
        localStorage.setItem("userId", String(d.users?.id ?? ""));
        if (d.users) setUser(d.users);
        router.push("/");
      } else {
        setError("Telefon raqam yoki parol noto'g'ri");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { errors?: { msg: string }[] } } })
        ?.response?.data?.errors?.[0]?.msg;
      setError(msg ?? "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-3"
            style={{ background: "var(--primary)" }}
          >
            Q
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Quvnaga kirish</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Hisobingizga kiring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Telefon raqam
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+998901234567"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none focus:ring-2"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none focus:ring-2"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Kirish
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          Hisobingiz yo'qmi?{" "}
          <Link href="/auth/register" style={{ color: "var(--primary)" }} className="font-medium">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  );
}
