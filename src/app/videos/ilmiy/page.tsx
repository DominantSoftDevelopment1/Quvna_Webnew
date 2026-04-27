"use client";

import { CategoryEmptyState } from "@/components/videos/CategoryEmptyState";

export default function IlmiyVideosPage() {
  return (
    <CategoryEmptyState
      title="Ilmiy bo'limi hozircha bo'sh"
      description="Ilmiy kategoriyasida hali video topilmadi. Yangi kontent qo'shilgach shu yerda ko'rinadi."
    />
  );
}

