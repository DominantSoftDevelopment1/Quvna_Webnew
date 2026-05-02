import { StreamViewerContent } from "@/components/stream/StreamViewerContent";

type PageProps = { params: Promise<{ id: string }> };

/** `params` async — Next.js 15+ sync dynamic API ogohlantirishlarini chetlab oʻtadi. */
export default async function StreamViewerRoutePage({ params }: PageProps) {
  const { id } = await params;
  const streamId = decodeURIComponent(id ?? "").trim();
  return <StreamViewerContent key={streamId} streamId={streamId} />;
}
