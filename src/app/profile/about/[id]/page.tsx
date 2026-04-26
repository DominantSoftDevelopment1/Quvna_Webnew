"use client";

import { api } from "@/lib/api";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface AboutDetail {
  title: string;
  body: string;
  detailsUrl?: string;
}

const DEFAULT_ABOUT_DETAILS: Record<string, AboutDetail> = {
  about: {
    title: "Quvna haqida",
    body: "Quvna - gaming va kontent platformasi bo'lib, foydalanuvchilar video joylashi, jonli efir qilishi va auditoriya bilan oson ishlashi mumkin.",
    detailsUrl: "https://quvna.com",
  },
  "what-is-quvna": {
    title: "Quvna o'zi nima?",
    body: "Quvna bu video, stream va ijtimoiy funksiyalarni bitta platformada birlashtiradigan zamonaviy mahsulot.",
    detailsUrl: "https://quvna.com/about",
  },
  "coin-how-1": {
    title: "Quvnada qanday qilib Coin ishlash mumkin?",
    body: "PUBG Mobile o'zining doimiy yangilanishlari bilan o'yinchilarni xursand qilishda davom etmoqda. O'yinning asosiy menyusi, yangi interfeysi va tozalangan navigatsiyasi foydalanuvchilar uchun yanada qulay bo'ldi.",
    detailsUrl: "https://quvna.com/help/coin",
  },
  "coin-how-2": {
    title: "Quvnada qanday qilib Coin ishlash mumkin?",
    body: "Coin ishlash uchun aktiv kontent joylash, foydalanuvchilar bilan interaksiya qilish va platforma qoidalariga mos faoliyat yuritish kerak bo'ladi.",
    detailsUrl: "https://quvna.com/help/coin",
  },
  "coin-how-3": {
    title: "Quvnada qanday qilib Coin ishlash mumkin?",
    body: "Foydali va qiziqarli videolar muntazam joylansa, tomoshabinlar soni ortadi va coin yig'ish imkoniyati oshadi.",
    detailsUrl: "https://quvna.com/help/coin",
  },
  "coin-how-4": {
    title: "Quvnada qanday qilib Coin ishlash mumkin?",
    body: "Platformadagi topshiriqlar va challenge'larda qatnashish ham coin yig'ishning samarali usullaridan biri hisoblanadi.",
    detailsUrl: "https://quvna.com/help/coin",
  },
  "coin-how-5": {
    title: "Quvnada qanday qilib Coin ishlash mumkin?",
    body: "Live efirlar, auditoriya bilan aloqa va sifatli kontent yaratish orqali coin tizimida yuqori natijalarga erishish mumkin.",
    detailsUrl: "https://quvna.com/help/coin",
  },
  "coin-how-6": {
    title: "Quvnada qanday qilib Coin ishlash mumkin?",
    body: "Coin ishlash strategiyasi uchun profilingizni to'liq to'ldiring, qoidalarni buzmasdan doimiy ravishda faol bo'ling.",
    detailsUrl: "https://quvna.com/help/coin",
  },
};

function normalizeDetail(raw: unknown): AboutDetail | null {
  const row =
    (raw as { data?: unknown })?.data ??
    (raw as { content?: unknown })?.content ??
    raw;

  if (!row || typeof row !== "object") return null;
  const obj = row as Record<string, unknown>;
  const title = String(obj.title ?? obj.name ?? obj.question ?? "Batafsil");
  const body = String(obj.body ?? obj.description ?? obj.content ?? obj.answer ?? "");
  const detailsUrl =
    obj.detailsUrl == null
      ? undefined
      : String(obj.detailsUrl);
  return { title, body, detailsUrl };
}

async function fetchAboutDetail(id: string): Promise<AboutDetail | null> {
  const paths = [`/api/about/${id}`, `/about/${id}`, `/api/content/about/${id}`];
  for (const path of paths) {
    try {
      const { data } = await api.get(path);
      const detail = normalizeDetail(data);
      if (detail) return detail;
    } catch {
      // try next endpoint
    }
  }
  return DEFAULT_ABOUT_DETAILS[id] ?? null;
}

export default function ProfileAboutDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params?.id ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["profile-about-detail", id],
    queryFn: () => fetchAboutDetail(id),
    enabled: Boolean(id),
  });

  return (
    <div style={{ minHeight: "100dvh", background: "#0b0d0e", color: "#fff", width: "100%" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          padding: "12px 16px calc(22px + env(safe-area-inset-bottom))",
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
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>
              {data?.title ?? "Batafsil"}
            </h1>
            <span />
          </div>
        </header>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ height: 14, borderRadius: 6, background: "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        ) : !data ? (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              padding: "14px 12px",
              color: "rgba(255,255,255,0.75)",
              fontSize: 14,
            }}
          >
            Ma&apos;lumot topilmadi.
          </div>
        ) : (
          <>
            <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 600, lineHeight: "24px" }}>{data.title}</h2>
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.72)",
                fontSize: 14,
                lineHeight: "22px",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.body}
            </p>
            <a
              href={data.detailsUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 10,
                color: "#facc15",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Batafsil
            </a>
          </>
        )}
      </div>
    </div>
  );
}

