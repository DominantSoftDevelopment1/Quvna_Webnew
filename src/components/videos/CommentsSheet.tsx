"use client";

import { useState, useRef, useEffect } from "react";
import { useVideoReactions, useSendComment } from "@/hooks/useMedia";
import type { CommentItem } from "@/hooks/useMedia";
import { cdnUrl } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoId: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Hozir";
  if (m < 60) return `${m} daq`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat`;
  return `${Math.floor(h / 24)} kun`;
}

export function CommentsSheet({ isOpen, onClose, videoId }: Props) {
  const { data: comments = [], isLoading } = useVideoReactions(videoId);
  const sendComment = useSendComment();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    sendComment.mutate({ videoId, text: text.trim() });
    setText("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      <div className="comments-backdrop" onClick={onClose} />
      <div className="comments-sheet">
        <div className="comments-handle" />
        <div className="comments-header">
          <span className="comments-title">Izohlar</span>
          <button type="button" className="comments-close" onClick={onClose} aria-label="Yopish">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="comments-list">
          {isLoading && (
            <p className="text-sm text-muted text-center py-4">Yuklanmoqda...</p>
          )}
          {!isLoading && !comments.length && (
            <p className="text-sm text-muted text-center py-8">Izohlar yo'q. Birinchi bo'ling!</p>
          )}
          {(comments as CommentItem[]).map((c) => {
            const u = c.userResponseDTO;
            const av = u?.attachmentResponseDTO?.preSignedUrl;
            const uname = u?.username ?? "user";
            return (
              <div key={c.id} className="comment-item">
                {av ? (
                  <img src={cdnUrl(av)} alt={uname} className="comment-avatar" />
                ) : (
                  <div className="comment-avatar-ph">{uname[0]?.toUpperCase()}</div>
                )}
                <div className="comment-body">
                  <p className="comment-username">@{uname}</p>
                  <p className="comment-text">{c.text}</p>
                  {c.createdAt && (
                    <p className="comment-time">{timeAgo(c.createdAt)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="comments-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="comments-input"
            placeholder="Izoh yozing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            type="button"
            className="comments-send-btn"
            onClick={handleSend}
            disabled={!text.trim()}
            aria-label="Yuborish"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
