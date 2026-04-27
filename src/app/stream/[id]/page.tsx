"use client";

import { useParams } from "next/navigation";
import { StreamViewerContent } from "@/components/stream/StreamViewerContent";

export default function StreamViewerPage() {
  const params = useParams<{ id: string }>();
  const streamId = String(params?.id ?? "");
  return <StreamViewerContent streamId={streamId} />;
}

