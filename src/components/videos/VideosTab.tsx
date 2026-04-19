"use client";

import { useVideos } from "@/hooks/useMedia";
import { cdnUrl, formatCount, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Play, Eye, Film } from "lucide-react";

export function VideosTab() {
  const { data, isLoading } = useVideos(0);
  const videos = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-[var(--bg-card)]">
            <Skeleton className="w-full aspect-video" />
            <div className="p-2.5 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-muted)]">
          <Film size={26} />
        </div>
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Videolar topilmadi</p>
        <p className="text-xs text-[var(--text-muted)]">Hozircha hech qanday video yo'q</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {videos.map((video: VideoItem) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <div className="group cursor-pointer flex flex-col gap-2">
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-card2)]">
        {video.thumbnailUrl || video.thumbnail ? (
          <img
            src={cdnUrl(video.thumbnailUrl ?? video.thumbnail)}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
            <Play size={28} />
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={16} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded">
            {video.duration}
          </span>
        )}
        {video.viewCount != null && (
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/60 text-white/90 text-[11px] px-1.5 py-0.5 rounded">
            <Eye size={9} />
            {formatCount(video.viewCount)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex gap-2 items-start">
        {video.user?.avatar && (
          <img
            src={cdnUrl(video.user.avatar)}
            alt={video.user.username}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
          />
        )}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-snug line-clamp-2 text-[var(--text-primary)]">
            {video.title}
          </p>
          {video.user && (
            <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
              {video.user.username ?? video.user.fullName}
            </p>
          )}
          {video.createdAt && (
            <p className="text-[11px] text-[var(--text-inactive)] mt-0.5">
              {timeAgo(video.createdAt)}
            </p>
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
  viewCount?: number;
  likeCount?: number;
  duration?: string;
  createdAt?: string;
  user?: { username?: string; fullName?: string; avatar?: string };
}
