"use client";

import { useState } from "react";
import { useVideos } from "@/hooks/useMedia";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Heart, Play } from "lucide-react";
import { ShortsFullScreen } from "./ShortsFullScreen";

interface ShortsTabProps {
  searchQuery?: string;
}

export function ShortsTab({ searchQuery }: ShortsTabProps) {
  const { data, isLoading } = useVideos(0);
  const shorts = data?.content ?? [];
  const [fullScreenOpen, setFullScreenOpen] = useState(false);

  const filteredShorts = searchQuery
    ? shorts.filter((v: VideoItem) =>
        v.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shorts;

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 sm:gap-1">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] w-full" />
        ))}
      </div>
    );
  }

  if (!filteredShorts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-sm font-semibold text-[var(--text-secondary)]">
          {searchQuery ? `"${searchQuery}" bo'yicha natija yo'q` : "Reels topilmadi"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5 sm:gap-1">
        {filteredShorts.map((video: VideoItem, index: number) => (
          <ReelCard key={video.id} video={video} onClick={() => { setFullScreenOpen(true); }} />
        ))}
      </div>

      {fullScreenOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          <button
            type="button"
            aria-label="Yopish"
            onClick={() => setFullScreenOpen(false)}
            className="absolute top-4 left-4 z-[110] w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <ShortsFullScreen />
        </div>
      )}
    </>
  );
}

function ReelCard({ video, onClick }: { video: VideoItem; onClick: () => void }) {
  return (
    <div
      className="relative aspect-[9/16] overflow-hidden cursor-pointer group bg-[var(--bg-card2)]"
      onClick={onClick}
    >
      {video.thumbnailUrl || video.thumbnail ? (
        <img
          src={cdnUrl(video.thumbnailUrl ?? video.thumbnail)}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/30">
          <Play size={24} />
        </div>
      )}
      {/* gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      {/* play icon on hover */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Play size={16} fill="white" className="text-white" />
      </div>
      {/* likes */}
      {video.likeCount != null && video.likeCount > 0 && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[12px] font-semibold">
          <Heart size={11} fill="white" className="text-white" />
          {formatCount(video.likeCount)}
        </div>
      )}
    </div>
  );
}

interface VideoItem {
  id: number;
  title: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  likeCount?: number;
  viewCount?: number;
}
