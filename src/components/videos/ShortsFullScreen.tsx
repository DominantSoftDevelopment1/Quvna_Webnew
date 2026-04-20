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
  const feedRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Bitta wheel = bitta video
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;
      isScrolling.current = true;

      const next = e.deltaY > 0
        ? Math.min(activeIndex + 1, videos.length - 1)
        : Math.max(activeIndex - 1, 0);

      setActiveIndex(next);
      const slide = el.children[next] as HTMLElement;
      if (slide) slide.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => { isScrolling.current = false; }, 700);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeIndex, videos.length]);

  // Mobil touch scroll — IntersectionObserver
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(el.children).indexOf(entry.target as HTMLElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: el, threshold: 0.6 }
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [videos.length]);

  useEffect(() => {
    if (activeIndex >= videos.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [activeIndex, videos.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const scrollTo = useCallback((idx: number) => {
    const el = feedRef.current;
    if (!el) return;
    const slide = el.children[idx] as HTMLElement;
    if (slide) slide.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveIndex(idx);
  }, []);

  if (isLoading) {
    return (
      <div className="short-feed">
        <div className="short-slide"><Skeleton className="w-full h-full" /></div>
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
      <div className="short-feed" ref={feedRef}>
        {videos.map((video, idx) => (
          <div key={video.id} className="short-slide">
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
          <div className="short-slide"><Skeleton className="w-full h-full" /></div>
        )}

        <CommentsSheet
          isOpen={!!commentsVideo}
          onClose={() => setCommentsVideo(null)}
          videoId={commentsVideo?.id ?? ""}
        />
      </div>
    </>
  );
}
