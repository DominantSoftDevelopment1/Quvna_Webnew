"use client";

import { useGameStore } from "@/hooks/useHome";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export function HomeGameStore() {
  const { data: items = [], isLoading } = useGameStore();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-28 h-36 shrink-0" />
        ))}
      </div>
    );
  }

  if (!items.length) return (
    <div className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
      Mahsulotlar topilmadi
    </div>
  );

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
      {items.map((item: GameStoreItem) => (
        <div
          key={item.id}
          className="shrink-0 w-28 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="w-full h-20 overflow-hidden">
            <img
              src={item.attachmentResponseDTO?.preSignedUrl ?? item.attachmentResponseDTO?.contentURL ?? cdnUrl(item.imageUrl ?? item.image)}
              alt={item.name ?? item.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-2">
            <p className="text-xs font-medium line-clamp-1" style={{ color: "var(--text-primary)" }}>
              {item.name ?? item.title}
            </p>
            {item.price != null && (
              <p className="text-xs mt-0.5 font-semibold" style={{ color: "var(--primary)" }}>
                ${formatCount(item.price)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface GameStoreItem {
  id: number;
  name?: string;
  title?: string;
  imageUrl?: string;
  image?: string;
  price?: number;
  attachmentResponseDTO?: { preSignedUrl?: string; contentURL?: string };
}
