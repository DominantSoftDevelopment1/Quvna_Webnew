"use client";

import { useVideos } from "@/hooks/useMedia";
import { cdnUrl, formatCount, timeAgo } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Play, Eye } from "lucide-react";

export function VideosTab() {
  const { data, isLoading } = useVideos(0);
  const videos = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!videos.length) return (
    <div className="text-sm py-12 text-center" style={{ color: "var(--text-muted)" }}>
      Videolar topilmadi
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video: VideoItem) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <div className="cursor-pointer group">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
        {video.thumbnailUrl || video.thumbnail ? (
          <img
            src={cdnUrl(video.thumbnailUrl ?? video.thumbnail)}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--bg-card2)" }}>
            <Play size={32} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={16} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1 rounded">
            {video.duration}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {video.user?.avatar && (
          <img
            src={cdnUrl(video.user.avatar)}
            alt={video.user.username}
            className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>
            {video.title}
          </p>
          {video.user && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {video.user.username ?? video.user.fullName}
            </p>
          )}
          <div className="flex items-center gap-2 mt-0.5">
            {video.viewCount != null && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <Eye size={10} />
                {formatCount(video.viewCount)}
              </span>
            )}
            {video.createdAt && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {timeAgo(video.createdAt)}
              </span>
            )}
          </div>
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
