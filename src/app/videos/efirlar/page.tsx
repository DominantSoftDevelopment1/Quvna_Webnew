"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { StreamViewerContent } from "@/components/stream/StreamViewerContent";
import { useStreams } from "@/hooks/useMedia";
import type { StreamListItem } from "@/hooks/useMedia";
import { CategoryEmptyState } from "@/components/videos/CategoryEmptyState";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Search, Users } from "lucide-react";

const FALLBACK_STREAM_IMAGE =
  "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1200&q=80";

function EfirlarPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: streams = [], isLoading } = useStreams();
  const [search, setSearch] = useState("");
  const selectedStreamId = searchParams.get("streamId");

  const openStream = (streamId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("streamId", streamId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const closeStream = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("streamId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  useEffect(() => {
    const shouldCompact = !!selectedStreamId;
    document.body.classList.toggle("stream-compact-sidebar", shouldCompact);
    return () => {
      document.body.classList.remove("stream-compact-sidebar");
    };
  }, [selectedStreamId]);

  if (isLoading) {
    return (
      <div className="w-full min-w-0 box-border">
        <div className="w-full px-10 py-7">
          <div className="mx-auto w-full max-w-[1500px] min-w-0 box-border px-10">
            <div className="h-10 w-[400px] rounded-none bg-white/[0.05] animate-pulse mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center lg:justify-items-start gap-x-6 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-full max-w-[340px]">
                <div className="aspect-video w-full rounded-xl border border-white/10 bg-white/[0.03] animate-pulse" />
                <div className="mt-2 h-3 w-[55%] rounded bg-white/[0.06] animate-pulse" />
                <div className="mt-2 h-5 w-[92%] rounded bg-white/[0.06] animate-pulse" />
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!streams.length) {
    return (
      <CategoryEmptyState
        title="Efirlar bo'limi hozircha bo'sh"
        description="Hozircha jonli efirlar yo'q. Stream boshlanganda shu yerda ko'rinadi."
      />
    );
  }

  return (
    <div className="w-full min-w-0 box-border">
      <div className="w-full px-10 py-7">
        <div className="mx-auto w-full max-w-[1500px] min-w-0 box-border px-5">
          <div className="min-w-0 box-border flex flex-col gap-6 pt-[10px] pb-[10px]">
          <div className="w-full min-w-0 box-border">
            <div className="w-[420px] max-w-full min-w-0 box-border">
              <div className="flex h-10 w-full min-w-0 box-border items-center gap-3 border border-white/20 bg-[#181818] transition focus-within:border-emerald-400 focus-within:bg-[#1f1f1f]" style={{ paddingLeft: 12, paddingRight: 12 }}>
                {!search && (
                  <Search size={16} className="shrink-0 pointer-events-none text-white/45" />
                )}
                <input
                  type="text"
                  placeholder="Qidirish"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-white/40 outline-none"
                />
              </div>
            </div>
          </div>

        <h1 className="text-white text-[38px] md:text-[46px] font-semibold tracking-[-0.04em] leading-none">
          Hozir streamda
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-center gap-x-6 gap-y-8">
          {streams.map((stream: StreamListItem) => {
            const cardContent = (
              <>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#111315] border border-white/10">
                  <img
                    src={stream.thumbnailUrl || stream.thumbnail ? cdnUrl(stream.thumbnailUrl ?? stream.thumbnail) : FALLBACK_STREAM_IMAGE}
                    alt={stream.name ?? stream.title ?? "live stream"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_STREAM_IMAGE;
                    }}
                  />
                  <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#ff3b30] text-white px-2 py-1 text-[11px] font-extrabold tracking-wide">
                    LIVE
                  </div>
                  <div className="absolute left-[58px] top-2.5 inline-flex items-center gap-1 rounded-md border border-white/20 bg-black/45 px-2 py-1 text-[11px] font-bold text-white">
                    <Users size={11} />
                    {formatCount(stream.liveUserCount ?? 0)}
                  </div>
                </div>
                <div className="mt-2 min-w-0 px-0.5">
                  <p className="text-white/75 text-[12px] leading-tight line-clamp-1 py-[1px]">
                    {stream.user?.username ? `@${stream.user.username}` : stream.user?.fullName ?? "Quvna creator"}
                  </p>
                  <p className="mt-1 text-white text-[17px] font-semibold leading-[1.25] line-clamp-2 py-[1px]">
                    {stream.name ?? stream.title ?? "Jonli efir"}
                  </p>
                </div>
              </>
            );

            return (
              <button
                key={String(stream.id)}
                type="button"
                onClick={() => openStream(String(stream.id))}
                className="group w-full max-w-[340px] text-left"
              >
                {cardContent}
              </button>
            );
          })}
        </div>
        </div>
        </div>
      </div>
      {selectedStreamId && (
        <div className="fixed inset-0 z-50 bg-black/75 p-1.5 md:p-2 lg:left-[76px] lg:p-2">
          <div className="flex h-full w-full flex-col border border-white/15 bg-[#0f1011]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-[14px]">
              <p className="text-[16px] font-semibold text-white">Jonli efir</p>
              <button
                type="button"
                onClick={closeStream}
                className="border border-white/20 px-3.5 py-2 text-[13px] font-semibold text-white"
              >
                Yopish
              </button>
            </div>
            <div className="h-full w-full min-h-0 flex-1 overflow-auto">
              <StreamViewerContent streamId={selectedStreamId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EfirlarPage() {
  return (
    <Suspense fallback={null}>
      <EfirlarPageContent />
    </Suspense>
  );
}

