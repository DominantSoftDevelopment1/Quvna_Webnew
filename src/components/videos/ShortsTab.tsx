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
  const [startIndex, setStartIndex] = useState(0);

  const filteredShorts = searchQuery
    ? shorts.filter((v: VideoItem) =>
        v.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : shorts;

  if (isLoading) {
    return (
      <div className="reels-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="reels-grid-item-skeleton" />
        ))}
      </div>
    );
  }

  if (!filteredShorts.length) {
    return (
      <div className="videos-empty">
        <p className="videos-empty-title">
          {searchQuery ? `"${searchQuery}" bo'yicha natija yo'q` : "Reels topilmadi"}
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
      <div className="reels-grid">
        {filteredShorts.map((video: VideoItem, index: number) => (
          <ReelCard key={video.id} video={video} onClick={() => openShort(index)} />
        ))}
      </div>

      {fullScreenOpen && (
        <div className="fixed inset-0 z-[100] bg-black">
          <button
            type="button"
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
    <div className="reels-grid-item group" onClick={onClick}>
      {video.thumbnailUrl || video.thumbnail ? (
        <img
          src={cdnUrl(video.thumbnailUrl ?? video.thumbnail)}
          alt={video.title}
          className="reels-grid-img"
        />
      ) : (
        <div className="reels-grid-no-thumb">
          <Play size={24} className="text-white/40" />
        </div>
      )}
      <div className="reels-grid-overlay" />
      <div className="reels-grid-play">
        <Play size={18} fill="white" className="text-white ml-0.5" />
      </div>
      <div className="reels-grid-bottom">
        {video.likeCount != null && video.likeCount > 0 && (
          <span className="reels-grid-likes">
            <Heart size={11} fill="white" className="text-white" />
            {formatCount(video.likeCount)}
          </span>
        )}
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
  viewCount?: number;
}
