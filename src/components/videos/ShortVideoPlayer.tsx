"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cdnUrl } from "@/lib/utils";
import type { VideoItem } from "@/hooks/useMedia";

interface Props {
  video: VideoItem;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onFollow: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function ShortVideoPlayer({
  video, isActive, onLike, onComment, onShare, onFollow, onPrev, onNext, hasPrev, hasNext
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPause, setShowPause] = useState(false);
  const [showLikeAnim, setShowLikeAnim] = useState(false);
  const [liked, setLiked] = useState(video.isPressLike ?? false);
  const [likeCount, setLikeCount] = useState(video.likeCount ?? 0);
  const [following, setFollowing] = useState(video.userResponseDTO?.currentUserIsFollower ?? false);
  const lastTap = useRef(0);

  const videoUrl = video.videoPSU ?? video.videoUrl ?? video.attachmentResponseDTO?.preSignedUrl;
  const thumbnail = video.thumbnailUrl ?? video.thumbnail;
  const user = video.userResponseDTO;
  const avatar = user?.attachmentResponseDTO?.preSignedUrl;
  const username = user?.username ?? "user";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || username;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
    }
  }, [isActive]);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) { setLiked(true); setLikeCount((c) => c + 1); onLike(); }
      setShowLikeAnim(true);
      setTimeout(() => setShowLikeAnim(false), 700);
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    setTimeout(() => {
      if (Date.now() - lastTap.current >= 290) {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play(); setPlaying(true); }
        else { v.pause(); setPlaying(false); }
        setShowPause(true);
        setTimeout(() => setShowPause(false), 600);
      }
    }, 300);
  }, [liked, onLike]);

  const handleLike = () => {
    setLiked((prev) => { setLikeCount((c) => prev ? c - 1 : c + 1); return !prev; });
    onLike();
  };

  const handleFollow = () => { setFollowing((p) => !p); onFollow(); };

  const fmt = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  return (
    <div className="ig-reel-wrap">

      {/* ── Video area ── */}
      <div className="ig-reel-video-area" onClick={handleTap}>
        {videoUrl ? (
          <video
            ref={videoRef}
            className="ig-reel-video"
            src={cdnUrl(videoUrl)}
            loop playsInline muted={muted}
            onTimeUpdate={handleTimeUpdate}
            poster={thumbnail ? cdnUrl(thumbnail) : undefined}
          />
        ) : thumbnail ? (
          <img src={cdnUrl(thumbnail)} alt="" className="ig-reel-video" />
        ) : (
          <div className="ig-reel-video ig-reel-video-empty" />
        )}

        <div className="ig-reel-gradient" />

        {showPause && (
          <div className="ig-reel-pause-wrap">
            <div className="ig-reel-pause-circle">
              {playing
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              }
            </div>
          </div>
        )}

        {showLikeAnim && (
          <div className="ig-reel-like-anim">
            <svg width="90" height="90" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}

        {/* Mute button — inline SVG */}
        <button type="button" aria-label={muted ? "Ovoz yoqish" : "Ovoz o'chirish"} className="ig-reel-mute-btn"
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}>
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>

        {/* Bottom info */}
        <div className="ig-reel-info" onClick={(e) => e.stopPropagation()}>
          <div className="ig-reel-user-row">
            {avatar
              ? <img src={cdnUrl(avatar)} alt={username} className="ig-reel-avatar" />
              : <div className="ig-reel-avatar-ph">{username[0]?.toUpperCase()}</div>
            }
            <span className="ig-reel-username">{displayName}</span>
            <span className="ig-reel-username-at">@{username}</span>
            <button type="button" onClick={handleFollow}
              className={`ig-reel-follow-btn${following ? " following" : ""}`}>
              {following ? "Kuzatilmoqda" : "Kuzatish"}
            </button>
          </div>
          {video.title && <p className="ig-reel-title">{video.title}</p>}
        </div>

        {/* Progress bar */}
        <div className="ig-reel-progress-wrap">
          <div className="ig-reel-progress-bar" style={{ width: `${progress}%` } as React.CSSProperties} />
        </div>
      </div>

      {/* ── Right actions — video tashqarisida, video o'ngidan 20px ── */}
      <div className="ig-reel-actions" onClick={(e) => e.stopPropagation()}>
        {/* Like */}
        <button type="button" className="ig-reel-action-btn" onClick={handleLike} aria-label="Like">
          <div className="ig-reel-action-icon">
            <img src="/icons/like.svg" alt="" width={28} height={28}
              className={liked ? "ig-icon-liked" : "icon-invert"} />
          </div>
          {likeCount > 0 && <span className="ig-reel-action-count">{fmt(likeCount)}</span>}
        </button>

        {/* Comment */}
        <button type="button" className="ig-reel-action-btn" onClick={onComment} aria-label="Izoh">
          <div className="ig-reel-action-icon">
            <img src="/icons/chat.svg" alt="" width={28} height={28} className="icon-invert" />
          </div>
          {(video.commentCount ?? 0) > 0 && <span className="ig-reel-action-count">{fmt(video.commentCount ?? 0)}</span>}
        </button>

        {/* Share */}
        <button type="button" className="ig-reel-action-btn" aria-label="Ulashish"
          onClick={() => navigator.share?.({ title: video.title, url: window.location.href }).catch(() => {})}>
          <div className="ig-reel-action-icon">
            <img src="/icons/forward.svg" alt="" width={28} height={28} className="icon-invert" />
          </div>
          {(video.shareCount ?? 0) > 0 && <span className="ig-reel-action-count">{fmt(video.shareCount ?? 0)}</span>}
        </button>
      </div>

      {/* ── Up/Down nav ── */}
      <div className="ig-reel-nav">
        <button type="button" aria-label="Oldingi"
          className={`ig-reel-nav-btn${!hasPrev ? " disabled" : ""}`}
          onClick={onPrev} disabled={!hasPrev}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
        <button type="button" aria-label="Keyingi"
          className={`ig-reel-nav-btn${!hasNext ? " disabled" : ""}`}
          onClick={onNext} disabled={!hasNext}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

    </div>
  );
}
