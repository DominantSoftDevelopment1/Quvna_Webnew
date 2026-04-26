"use client";

import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface AboutItem {
  id: string;
  title: string;
  excerpt?: string;
  detailsUrl?: string;
}

const DEFAULT_ABOUT_ITEMS: AboutItem[] = [
  { id: "about", title: "Quvna haqida", detailsUrl: "https://quvna.com" },
  { id: "what-is-quvna", title: "Quvna o'zi nima?", detailsUrl: "https://quvna.com/about" },
  { id: "coin-how-1", title: "Quvnada qanday qilib Coin ishlash mumkin?", detailsUrl: "https://quvna.com/help/coin" },
  { id: "coin-how-2", title: "Quvnada qanday qilib Coin ishlash mumkin?", detailsUrl: "https://quvna.com/help/coin" },
  { id: "coin-how-3", title: "Quvnada qanday qilib Coin ishlash mumkin?", detailsUrl: "https://quvna.com/help/coin" },
  { id: "coin-how-4", title: "Quvnada qanday qilib Coin ishlash mumkin?", detailsUrl: "https://quvna.com/help/coin" },
  { id: "coin-how-5", title: "Quvnada qanday qilib Coin ishlash mumkin?", detailsUrl: "https://quvna.com/help/coin" },
  { id: "coin-how-6", title: "Quvnada qanday qilib Coin ishlash mumkin?", detailsUrl: "https://quvna.com/help/coin" },
];

function normalizeList(raw: unknown): AboutItem[] {
  const source =
    (raw as { data?: unknown })?.data ??
    (raw as { content?: unknown })?.content ??
    (raw as { items?: unknown })?.items ??
    raw;

  const arr = Array.isArray(source) ? source : [];
  return arr
    .flatMap((item, index) => {
      if (!item || typeof item !== "object") return [];
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row.slug ?? row.key ?? index);
      const title = String(row.title ?? row.name ?? row.question ?? "Sahifa");
      const excerpt = row.excerpt ?? row.summary ?? row.shortDescription;
      return [{
        id,
        title,
        excerpt: excerpt == null ? undefined : String(excerpt),
        detailsUrl:
          row.detailsUrl == null
            ? undefined
            : String(row.detailsUrl),
      }];
    })
    .filter((v) => Boolean(v.id && v.title));
}

async function fetchAboutList(): Promise<AboutItem[]> {
  const paths = ["/api/about", "/about", "/api/content/about"];
  for (const path of paths) {
    try {
      const { data } = await api.get(path);
      const list = normalizeList(data);
      if (list.length > 0) return list;
    } catch {
      // try next endpoint
    }
  }
  return DEFAULT_ABOUT_ITEMS;
}

export default function ProfileAboutPage() {
  const router = useRouter();
  const { data = [], isLoading } = useQuery({
    queryKey: ["profile-about-list"],
    queryFn: fetchAboutList,
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
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Quvna haqida</h1>
            <span />
          </div>
        </header>

        {isLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  height: 54,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
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
            Hozircha ma&apos;lumot topilmadi.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map((item) => (
              <Link
                key={item.id}
                href={`/profile/about/${encodeURIComponent(item.id)}`}
                style={{
                  width: "100%",
                  minHeight: 54,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.04)",
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
                <span style={{ fontSize: 14, lineHeight: "20px" }}>{item.title}</span>
                <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

