"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useStreams, type StreamListItem } from "@/hooks/useMedia";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

export function HomeBanner() {
  const { data: streams = [], isLoading } = useStreams();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Auto-scroll with IntersectionObserver
  useEffect(() => {
    if (streams.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % streams.length;
        // Scroll to the next card
        if (scrollRef.current) {
          const card = scrollRef.current.children[next] as HTMLElement;
          if (card) {
            card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          }
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [streams.length]);

  // Update index on scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || streams.length <= 1) return;

    const handleScroll = () => {
      const cardWidth = 300 + 12; // card width + gap
      const newIndex = Math.round(el.scrollLeft / cardWidth);
      setIndex(Math.min(newIndex, streams.length - 1));
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [streams.length]);

  // Drag to scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleDotClick = useCallback((i: number) => {
    setIndex(i);
    if (scrollRef.current) {
      const card = scrollRef.current.children[i] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="pt-5">
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="banner-card" />
          ))}
        </div>
      </div>
    );
  }

  if (!streams.length) {
    return (
      <div className="pt-5">
        <div className="banner-empty">
          <img src="/icons/stream.svg" alt="" width={32} height={32} className="opacity-30" />
          <p>Hozirda jonli efirlar yo'q</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-5">
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-none cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex gap-3">
          {streams.map((stream: StreamListItem) => (
            <StreamBannerCard key={stream.id} stream={stream} />
          ))}
        </div>
      </div>

      {streams.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {streams.map((_: unknown, i: number) => (
            <button
              type="button"
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => handleDotClick(i)}
              className={`banner-dot${i === index ? " active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StreamBannerCard({ stream }: { stream: StreamListItem }) {
  return (
    <Link href={`/stream/${stream.id}`} className="banner-card">
      {stream.thumbnailUrl || stream.thumbnail ? (
        <img
          src={cdnUrl(stream.thumbnailUrl ?? stream.thumbnail)}
          alt={stream.name ?? stream.title ?? ""}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-card2" />
      )}

      <div className="banner-gradient" />

      {stream.liveUserCount != null && (
        <div className="banner-viewer-badge">
          <img src="/icons/eye.svg" alt="" width={12} height={12} className="icon-invert" />
          {formatCount(stream.liveUserCount)}
        </div>
      )}

      <div className="banner-bottom">
        <LiveAvatar avatar={stream.user?.avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white leading-snug line-clamp-1">
            {stream.name ?? stream.title}
          </p>
          <p className="stream-username">
            {stream.user?.username ? `@${stream.user.username}` : stream.user?.fullName ?? ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

function LiveAvatar({ avatar }: { avatar?: string }) {
  return (
    <div className="live-avatar-wrap">
      <div className="live-avatar-ring">
        {avatar ? (
          <img src={cdnUrl(avatar)} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <div className="w-full h-full rounded-full bg-card2" />
        )}
      </div>
      <div className="live-badge">
        <div className="live-dot" />
        <span className="live-text">live</span>
      </div>
    </div>
  );
}

