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
      if (!liked) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        onLike();
      }
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

  const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
  };

  return (
    /* Instagram Reels layout: video center, actions right, nav arrows far right */
    <div className="ig-reel-wrap">

      {/* ── Video area ── */}
      <div className="ig-reel-video-area" onClick={handleTap}>
        {videoUrl ? (
          <video
            ref={videoRef}
            className="ig-reel-video"
            src={cdnUrl(videoUrl)}
            loop
            playsInline
            muted={muted}
            onTimeUpdate={handleTimeUpdate}
            poster={thumbnail ? cdnUrl(thumbnail) : undefined}
          />
        ) : thumbnail ? (
          <img src={cdnUrl(thumbnail)} alt="" className="ig-reel-video" />
        ) : (
          <div className="ig-reel-video ig-reel-video-empty" />
        )}

        {/* gradient bottom */}
        <div className="ig-reel-gradient" />

        {/* pause indicator */}
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

        {/* double-tap like anim */}
        {showLikeAnim && (
          <div className="ig-reel-like-anim">
            <svg width="90" height="90" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        )}

        {/* mute button */}
        <button
          type="button"
          aria-label={muted ? "Ovoz yoqish" : "Ovoz o'chirish"}
          className="ig-reel-mute-btn"
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
        >
          {muted
            ? <img src="/icons/mute.svg" alt="mute" width={18} height={18} className="icon-invert" />
            : <img src="/icons/volume.svg" alt="volume" width={18} height={18} className="icon-invert" />
          }
        </button>

        {/* bottom info */}
        <div className="ig-reel-info" onClick={(e) => e.stopPropagation()}>
          <div className="ig-reel-user-row">
            {avatar
              ? <img src={cdnUrl(avatar)} alt={username} className="ig-reel-avatar" />
              : <div className="ig-reel-avatar-ph">{username[0]?.toUpperCase()}</div>
            }
            <span className="ig-reel-username">{displayName}</span>
            <span className="ig-reel-username-at">@{username}</span>
            <button
              type="button"
              onClick={handleFollow}
              className={`ig-reel-follow-btn${following ? " following" : ""}`}
            >
              {following ? "Kuzatilmoqda" : "Kuzatish"}
            </button>
          </div>
          {video.title && (
            <p className="ig-reel-title">{video.title}</p>
          )}
        </div>

        {/* progress bar */}
        <div className="ig-reel-progress-wrap">
          <div className="ig-reel-progress-bar" style={{ width: `${progress}%` } as React.CSSProperties} />
        </div>
      </div>

      {/* ── Right actions (Instagram style) ── */}
      <div className="ig-reel-actions" onClick={(e) => e.stopPropagation()}>
        {/* Like */}
        <button type="button" className="ig-reel-action-btn" onClick={handleLike} aria-label="Like">
          <div className={`ig-reel-action-icon${liked ? " liked" : ""}`}>
            {liked
              ? <img src="/icons/heart-filled.svg" alt="" width={24} height={24} className="icon-heart-liked" />
              : <img src="/icons/heart.svg" alt="" width={24} height={24} className="icon-invert" />
            }
          </div>
          {likeCount > 0 && <span className="ig-reel-action-count">{formatCount(likeCount)}</span>}
        </button>

        {/* Comment */}
        <button type="button" className="ig-reel-action-btn" onClick={onComment} aria-label="Izoh">
          <div className="ig-reel-action-icon">
            <img src="/icons/comment.svg" alt="" width={24} height={24} className="icon-invert" />
          </div>
          {(video.commentCount ?? 0) > 0 && (
            <span className="ig-reel-action-count">{formatCount(video.commentCount ?? 0)}</span>
          )}
        </button>

        {/* Share */}
        <button
          type="button"
          className="ig-reel-action-btn"
          aria-label="Ulashish"
          onClick={() => navigator.share?.({ title: video.title, url: window.location.href }).catch(() => {})}
        >
          <div className="ig-reel-action-icon">
            <img src="/icons/share.svg" alt="" width={24} height={24} className="icon-invert" />
          </div>
          {(video.shareCount ?? 0) > 0 && (
            <span className="ig-reel-action-count">{formatCount(video.shareCount ?? 0)}</span>
          )}
        </button>

        {/* More */}
        <button type="button" className="ig-reel-action-btn" aria-label="Ko'proq">
          <div className="ig-reel-action-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
            </svg>
          </div>
        </button>
      </div>

      {/* ── Up/Down navigation (far right, Instagram style) ── */}
      <div className="ig-reel-nav">
        <button
          type="button"
          aria-label="Oldingi"
          className={`ig-reel-nav-btn${!hasPrev ? " disabled" : ""}`}
          onClick={onPrev}
          disabled={!hasPrev}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
        <button
          type="button"
          aria-label="Keyingi"
          className={`ig-reel-nav-btn${!hasNext ? " disabled" : ""}`}
          onClick={onNext}
          disabled={!hasNext}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>

    </div>
  );
}
