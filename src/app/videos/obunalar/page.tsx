"use client";

import { CategoryEmptyState } from "@/components/videos/CategoryEmptyState";

export default function ObunalarVideosPage() {
  return (
    <CategoryEmptyState
      title="Obunalar bo'limi hozircha bo'sh"
      description="Obuna bo'lgan kanallaringizdan hali video yo'q. Yangi video chiqqanda shu yerda paydo bo'ladi."
    />
  );
}

