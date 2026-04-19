"use client";

import { useState } from "react";
import { useVideos } from "@/hooks/useMedia";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Play, Heart, Film } from "lucide-react";
import { ShortsFullScreen } from "./ShortsFullScreen";

interface ShortsTabProps {
  searchQuery?: string;
}

export function ShortsTab({ searchQuery }: ShortsTabProps) {
  const { data, isLoading } = useVideos(0);
  const shorts = data?.content ?? [];
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  // Filter by search query
  const filteredShorts = searchQuery
    ? shorts.filter((v: VideoItem) =>
        v.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shorts;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!filteredShorts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: "var(--bg-card)" }}
        >
          <Film size={32} style={{ color: "var(--text-muted)" }} />
        </div>
        <p className="text-base font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
          {searchQuery ? `"${searchQuery}" bo'yicha natija yo'q` : "Shorts topilmadi"}
        </p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {searchQuery ? "Boshqa so'z bilan qidirib ko'ring" : "Hozircha hech qanday short video yo'q"}
        </p>
      </div>
    );
  }

  const openShort = (index: number) => {
    setStartIndex(index);
    setFullScreenOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredShorts.map((video: VideoItem, index: number) => (
          <ShortCard key={video.id} video={video} onClick={() => openShort(index)} />
        ))}
      </div>

      {fullScreenOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          <button
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

function ShortCard({ video, onClick }: { video: VideoItem; onClick: () => void }) {
  return (
    <div
      className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {video.thumbnailUrl || video.thumbnail ? (
        <img
          src={cdnUrl(video.thumbnailUrl ?? video.thumbnail)}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-card2)" }}>
          <Film size={32} style={{ color: "var(--text-muted)" }} />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Play size={20} className="text-white ml-1" fill="white" />
        </div>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white text-xs font-medium line-clamp-2 leading-tight mb-1">
          {video.title || "No title"}
        </p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-white/70 text-xs">
            <Heart size={10} />
            {formatCount(video.likeCount ?? 0)}
          </span>
          {video.viewCount != null && (
            <span className="flex items-center gap-1 text-white/70 text-xs">
              <Play size={10} />
              {formatCount(video.viewCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface VideoItem {
  id: number;
  title: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  createdAt?: string;
}
