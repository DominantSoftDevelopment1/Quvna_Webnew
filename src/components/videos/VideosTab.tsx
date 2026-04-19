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
      <div className="videos-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="video-card-skeleton">
            <Skeleton className="video-card-thumb-skeleton" />
            <div className="p-3 space-y-2">
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
      <div className="videos-empty">
        <div className="videos-empty-icon">
          <Film size={28} />
        </div>
        <p className="videos-empty-title">Videolar topilmadi</p>
        <p className="videos-empty-sub">Hozircha hech qanday video yo'q</p>
      </div>
    );
  }

  return (
    <div className="videos-grid">
      {videos.map((video: VideoItem) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: VideoItem }) {
  return (
    <div className="video-card group cursor-pointer">
      <div className="video-card-thumb">
        {video.thumbnailUrl || video.thumbnail ? (
          <img
            src={cdnUrl(video.thumbnailUrl ?? video.thumbnail)}
            alt={video.title}
            className="video-card-img"
          />
        ) : (
          <div className="video-card-no-thumb">
            <Play size={28} />
          </div>
        )}
        <div className="video-card-hover-overlay">
          <div className="video-card-play-btn">
            <Play size={18} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="video-card-duration">{video.duration}</span>
        )}
        {video.viewCount != null && (
          <span className="video-card-views">
            <Eye size={10} />
            {formatCount(video.viewCount)}
          </span>
        )}
      </div>

      <div className="video-card-info">
        {video.user?.avatar && (
          <img
            src={cdnUrl(video.user.avatar)}
            alt={video.user.username}
            className="video-card-avatar"
          />
        )}
        <div className="video-card-meta">
          <p className="video-card-title">{video.title}</p>
          {video.user && (
            <p className="video-card-author">
              {video.user.username ?? video.user.fullName}
            </p>
          )}
          {video.createdAt && (
            <p className="video-card-time">{timeAgo(video.createdAt)}</p>
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
