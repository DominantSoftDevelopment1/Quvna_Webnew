"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
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
      console.log("[v0] Login attempt:", { phoneNumber: cleanPhone });
      const { data } = await api.post("/api/auth/login", { phoneNumber: cleanPhone });
      console.log("[v0] Login response:", data);
      const d = data?.data;
      if (d?.accessToken) {
        console.log("[v0] Login successful, setting tokens");
        setTokens(d.accessToken, d.refreshToken);
        localStorage.setItem("userId", String(d.users?.id ?? ""));
        if (d.users) setUser(d.users);
        router.push("/");
      } else {
        console.log("[v0] No access token in response");
        setError("Telefon raqam yoki parol noto'g'ri");
      }
    } catch (err: unknown) {
      console.log("[v0] Login error:", err);
      const msg = (err as { response?: { data?: { errors?: { msg: string }[] } } })
        ?.response?.data?.errors?.[0]?.msg;
      setError(msg ?? "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center gap-5 leading-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center my-2.5">
          <div
            className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold leading-8 text-white"
            style={{ background: "var(--primary)" }}
          >
            Q
          </div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Quvnaga kirish</h1>
          <p className="mt-1 py-[5px] text-sm" style={{ color: "var(--text-muted)" }}>
            Hisobingizga kiring
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-base font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Telefon raqam
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+998901234567"
              className="my-[5px] w-full rounded-xl text-base outline-none focus:ring-2"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                padding: "8px",
              }}
            />
          </div>



          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mx-0 my-2.5 flex w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--primary)", padding: "8px" }}
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

        <p className="text-center text-sm" style={{ color: "var(--text-muted)", marginTop: 16 }}>
          Hisobingiz yo'qmi?{" "}
          <Link href="/auth/register" style={{ color: "var(--primary)" }} className="font-medium">
            Ro'yxatdan o'tish
          </Link>
        </p>
      </div>
    </div>
  );
}
