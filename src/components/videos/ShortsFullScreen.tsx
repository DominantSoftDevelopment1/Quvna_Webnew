"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useInfiniteShorts, useLikeVideo, useFollowUser } from "@/hooks/useMedia";
import type { VideoItem } from "@/hooks/useMedia";
import { ShortVideoPlayer } from "./ShortVideoPlayer";
import { CommentsSheet } from "./CommentsSheet";
import { Skeleton } from "@/components/ui/Skeleton";

export function ShortsFullScreen() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteShorts();
  const likeVideo = useLikeVideo();
  const followUser = useFollowUser();

  const videos: VideoItem[] = data?.pages.flatMap((p) => p.content ?? []) ?? [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [commentsVideo, setCommentsVideo] = useState<VideoItem | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [videos.length]);

  useEffect(() => {
    if (activeIndex >= videos.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [activeIndex, videos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const setSlideRef = useCallback((el: HTMLDivElement | null, idx: number) => {
    slideRefs.current[idx] = el;
    if (el) observerRef.current?.observe(el);
  }, []);

  const scrollTo = (idx: number) => {
    const el = slideRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="short-feed">
        <div className="short-slide">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="short-feed flex items-center justify-center">
        <p className="text-white/60 text-sm">Videolar topilmadi</p>
      </div>
    );
  }

  return (
    <>
      <div className="short-feed">
        {videos.map((video, idx) => (
          <div key={video.id} ref={(el) => setSlideRef(el, idx)}>
            <ShortVideoPlayer
              video={video}
              isActive={idx === activeIndex}
              onLike={() => likeVideo.mutate({ videoId: video.id, isLiked: video.isPressLike ?? false })}
              onComment={() => setCommentsVideo(video)}
              onShare={() => navigator.share?.({ title: video.title, url: window.location.href }).catch(() => {})}
              onFollow={() => video.userResponseDTO?.id && followUser.mutate(video.userResponseDTO.id)}
              onPrev={() => scrollTo(idx - 1)}
              onNext={() => scrollTo(idx + 1)}
              hasPrev={idx > 0}
              hasNext={idx < videos.length - 1}
            />
          </div>
        ))}
        {isFetchingNextPage && (
          <div className="short-slide">
            <Skeleton className="w-full h-full" />
          </div>
        )}
      </div>

      <CommentsSheet
        isOpen={!!commentsVideo}
        onClose={() => setCommentsVideo(null)}
        videoId={commentsVideo?.id ?? ""}
      />
    </>
  );
}
