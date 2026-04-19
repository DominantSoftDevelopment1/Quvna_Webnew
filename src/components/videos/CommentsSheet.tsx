"use client";

import { useState, useRef, useEffect } from "react";
import { useVideoReactions, useSendComment } from "@/hooks/useMedia";
import type { CommentItem } from "@/hooks/useMedia";
import { cdnUrl } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Hozir";
  if (m < 60) return `${m} daq`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} kun`;
  return `${Math.floor(d / 7)} haf`;
}

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

const EMOJIS = ["❤️", "🔥", "👏", "😍", "😮", "😂"];

export function CommentsSheet({ isOpen, onClose, videoId }: Props) {
  const { data: comments = [], isLoading } = useVideoReactions(videoId);
  const sendComment = useSendComment();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
    else { setReplyTo(null); setText(""); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    sendComment.mutate({ videoId, text: text.trim() });
    setText("");
    setReplyTo(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const toggleLike = (id: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleReply = (username: string, id: string) => {
    setReplyTo(id);
    setText(`@${username} `);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="cs-backdrop" onClick={onClose} />
      <div className="cs-sheet" ref={sheetRef}>
        <div className="cs-handle" />
        <div className="cs-header">
          <span className="cs-title">Kommentariylar</span>
          <button type="button" className="cs-close-btn" onClick={onClose} aria-label="Yopish">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className="cs-list">
          {isLoading && (
            <p className="cs-empty">Yuklanmoqda...</p>
          )}
          {!isLoading && !(comments as CommentItem[]).length && (
            <div className="cs-no-comments">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p>Birinchi izoh qoldiring!</p>
            </div>
          )}
          {(comments as CommentItem[]).map((c) => {
            const u = c.userResponseDTO;
            const av = u?.attachmentResponseDTO?.preSignedUrl;
            const uname = u?.username ?? "user";
            const liked = likedComments.has(c.id);
            const likeCount = (c as { likeCount?: number }).likeCount ?? 0;
            const replies = (c as { replies?: CommentItem[] }).replies ?? [];
            const showReplies = expandedReplies.has(c.id);

            return (
              <div key={c.id} className="cs-comment">
                <div className="cs-comment-row">
                  {av ? (
                    <img src={cdnUrl(av)} alt={uname} className="cs-avatar" />
                  ) : (
                    <div className="cs-avatar-ph">{uname[0]?.toUpperCase()}</div>
                  )}
                  <div className="cs-comment-body">
                    <div className="cs-comment-top">
                      <div className="cs-comment-content">
                        <span className="cs-comment-user">{uname}</span>
                        {c.createdAt && <span className="cs-comment-time">{timeAgo(c.createdAt)}</span>}
                        <p className="cs-comment-text">{c.text}</p>
                        <div className="cs-comment-actions">
                          {(likeCount + (liked ? 1 : 0)) > 0 && (
                            <span className="cs-comment-likes">{fmt(likeCount + (liked ? 1 : 0))} ta yoqdi</span>
                          )}
                          <button type="button" className="cs-reply-btn" onClick={() => handleReply(uname, c.id)}>
                            Javob berish
                          </button>
                        </div>
                      </div>
                      <button type="button" className="cs-like-btn" onClick={() => toggleLike(c.id)} aria-label="Yoqtirish">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "#FF3040" : "none"} stroke={liked ? "#FF3040" : "currentColor"} strokeWidth="2">
                          <path d="M12 20.5C12 20.5 2 14.5 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 14.5 12 20.5 12 20.5Z"/>
                        </svg>
                      </button>
                    </div>

                    {replies.length > 0 && (
                      <button type="button" className="cs-show-replies" onClick={() => toggleReplies(c.id)}>
                        <span className="cs-replies-line" />
                        {showReplies ? "Javoblarni yashirish" : `Barcha javoblarni ko'rish (${replies.length})`}
                      </button>
                    )}

                    {showReplies && replies.map((r) => {
                      const ru = r.userResponseDTO;
                      const rav = ru?.attachmentResponseDTO?.preSignedUrl;
                      const runame = ru?.username ?? "user";
                      const rLiked = likedComments.has(r.id);
                      return (
                        <div key={r.id} className="cs-reply-row">
                          {rav ? (
                            <img src={cdnUrl(rav)} alt={runame} className="cs-reply-avatar" />
                          ) : (
                            <div className="cs-reply-avatar-ph">{runame[0]?.toUpperCase()}</div>
                          )}
                          <div className="cs-comment-content">
                            <span className="cs-comment-user">{runame}</span>
                            {r.createdAt && <span className="cs-comment-time">{timeAgo(r.createdAt)}</span>}
                            <p className="cs-comment-text">{r.text}</p>
                            <div className="cs-comment-actions">
                              <button type="button" className="cs-reply-btn" onClick={() => handleReply(runame, r.id)}>
                                Javob berish
                              </button>
                            </div>
                          </div>
                          <button type="button" className="cs-like-btn" onClick={() => toggleLike(r.id)} aria-label="Yoqtirish">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill={rLiked ? "#FF3040" : "none"} stroke={rLiked ? "#FF3040" : "currentColor"} strokeWidth="2">
                              <path d="M12 20.5C12 20.5 2 14.5 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 14.5 12 20.5 12 20.5Z"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emoji row */}
        <div className="cs-emoji-row">
          {EMOJIS.map((e) => (
            <button key={e} type="button" className="cs-emoji-btn" onClick={() => setText((t) => t + e)}>
              {e}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="cs-input-wrap">
          <div className="cs-input-box">
            {replyTo && (
              <div className="cs-reply-badge">
                <span>Javob berilmoqda</span>
                <button type="button" onClick={() => { setReplyTo(null); setText(""); }}>✕</button>
              </div>
            )}
            <div className="cs-input-row">
              <input
                ref={inputRef}
                type="text"
                className="cs-input"
                placeholder="Kommentariy qo'shing..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
              />
              <button
                type="button"
                className={`cs-send-btn${text.trim() ? " active" : ""}`}
                onClick={handleSend}
                disabled={!text.trim()}
              >
                Yuborish
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
