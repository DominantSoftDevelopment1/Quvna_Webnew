"use client";

import { useStreamStudio } from "@/hooks/useStreamStudio";
import { StreamStudioShell } from "@/components/stream/studio/StreamStudioShell";

export default function StreamStudioPage() {
  const studio = useStreamStudio();
  return <StreamStudioShell studio={studio} />;
}
