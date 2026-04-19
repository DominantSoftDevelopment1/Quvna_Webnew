"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", fullName: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setTokens, setUser } = useAuthStore();
  const router = useRouter();

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Parollar mos emas");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register/v3", {
        username: form.username,
        fullName: form.fullName,
        password: form.password,
      });
      const d = data?.data;
      if (d?.accessToken) {
        setTokens(d.accessToken, d.refreshToken);
        if (d.user) setUser(d.user);
        router.push("/");
      } else {
        setError("Ro'yxatdan o'tishda xatolik");
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-3"
            style={{ background: "var(--primary)" }}
          >
            Q
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Quvnaga qo'shiling</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Yangi hisob yarating
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "username", label: "Foydalanuvchi nomi", placeholder: "username", type: "text" },
            { key: "fullName", label: "To'liq ism", placeholder: "Ismoil Karimov", type: "text" },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {label}
              </label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                required
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          ))}

          {[
            { key: "password", label: "Parol" },
            { key: "confirmPassword", label: "Parolni tasdiqlang" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {label}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm outline-none"
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
          ))}

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
                <UserPlus size={16} />
                Ro'yxatdan o'tish
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
          Hisobingiz bormi?{" "}
          <Link href="/auth/login" style={{ color: "var(--primary)" }} className="font-medium">
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
