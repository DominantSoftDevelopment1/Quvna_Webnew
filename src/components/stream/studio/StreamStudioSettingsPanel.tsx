"use client";

import { useState, useRef } from "react";
import { Check, Copy, Pin, RefreshCw } from "lucide-react";
import type { StreamStudioController } from "@/components/stream/studio/streamStudioTypes";

type Props = Pick<
  StreamStudioController,
  | "streamId"
  | "streamKey"
  | "serverUrl"
  | "title"
  | "setTitle"
  | "pinnedMessage"
  | "setPinnedMessage"
  | "hashtags"
  | "setHashtags"
  | "tagInput"
  | "setTagInput"
  | "busy"
  | "regenerateKey"
  | "game"
  | "setGame"
>;

function CopyRow({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
        return;
      }
    } catch {
      /* fall through */
    }
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  };

  return (
    <div className="group flex min-w-0 items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <input
          ref={inputRef}
          readOnly
          value={value}
          aria-label={label}
          className="box-border min-h-[40px] w-full min-w-0 rounded-md border border-[#26262c] bg-[#0e0e10] px-3 py-2 font-mono text-xs leading-normal text-[#adadb8] outline-none focus:border-[#a970ff]/35"
        />
      </div>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className={`box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#26262c] transition ${
          copied ? "border-[#00f593]/30 bg-[#00f593]/10 text-[#00f593]" : "text-[#adadb8] hover:bg-[#26262c]"
        }`}
        title="Nusxalash"
      >
        {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      </button>
    </div>
  );
}

function SecretKeyRow({ value, label }: { value: string; label: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const display = show ? value : "•".repeat(Math.min(Math.max(value.length || 12, 12), 24));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-xs text-[#adadb8]">{label}</label>
        <button type="button" onClick={() => setShow((s) => !s)} className="shrink-0 text-xs text-[#a970ff]/85 hover:text-[#a970ff]">
          {show ? "Yashirish" : "Ko&apos;rsatish"}
        </button>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <input
          readOnly
          value={display}
          className="box-border min-h-[40px] min-w-0 flex-1 rounded-md border border-[#26262c] bg-[#0e0e10] px-3 py-2 font-mono text-xs text-[#adadb8] outline-none"
        />
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#26262c] transition ${
            copied ? "border-[#00f593]/30 bg-[#00f593]/10 text-[#00f593]" : "text-[#adadb8] hover:bg-[#26262c]"
          }`}
          title="Nusxalash"
        >
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        </button>
      </div>
    </div>
  );
}

export function StreamStudioSettingsPanel({
  streamId,
  streamKey,
  serverUrl,
  title,
  setTitle,
  pinnedMessage,
  setPinnedMessage,
  hashtags,
  setHashtags,
  tagInput,
  setTagInput,
  busy,
  regenerateKey,
  game,
  setGame,
}: Props) {
  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (hashtags.includes(tag)) return;
    setHashtags([...hashtags, tag]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  return (
    <div className="box-border w-full min-w-0 border-t border-[#26262c] bg-[#18181b] p-4">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#adadb8]">Stream sozlamalari</h3>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0">
          {streamId ? (
            <SecretKeyRow value={streamKey} label="Stream key" />
          ) : (
            <div>
              <label className="mb-1 block text-xs text-[#adadb8]">Stream key</label>
              <p className="text-xs text-[#53535f]">Avval stream yarating</p>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-xs text-[#adadb8]">Server URL</label>
          <CopyRow value={serverUrl} />
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <label className="mb-1 block text-xs text-[#adadb8]">Sarlavxa</label>
        <div className="flex min-w-0 gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="box-border min-h-[40px] min-w-0 flex-1 rounded-md border border-[#26262c] bg-[#0e0e10] px-3 py-2 text-sm text-[#efeff1] outline-none focus:border-[#a970ff]/35"
            placeholder="Stream nomi"
          />
          <button
            type="button"
            onClick={() => setTitle((t) => t.trim())}
            className="shrink-0 rounded-md bg-[#a970ff] px-4 py-2 text-sm font-semibold text-[#0e0e10] hover:brightness-110"
          >
            Saqlash
          </button>
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <label className="mb-1 block text-xs text-[#adadb8]">Kategoriya</label>
        <select
          value={game}
          onChange={(e) => setGame(e.target.value)}
          className="box-border min-h-[40px] w-full min-w-0 rounded-md border border-[#26262c] bg-[#0e0e10] px-3 py-2 text-sm text-[#efeff1] outline-none focus:border-[#a970ff]/35"
        >
          <option>PUBG MOBILE</option>
          <option>FREE FIRE</option>
          <option>MOBILE LEGENDS</option>
          <option>STEAM</option>
          <option>BOSHQA</option>
        </select>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1 block text-xs text-[#adadb8]">Hashteglar</label>
          <div className="box-border flex min-h-[40px] min-w-0 flex-wrap items-center gap-1.5 rounded-md border border-[#26262c] bg-[#0e0e10] px-2 py-1.5">
            {hashtags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#26262c] px-2 py-0.5 text-xs text-[#bf94ff]">
                #{tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="text-[#53535f] hover:text-[#efeff1]">
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder={hashtags.length === 0 ? "Tag + Enter" : ""}
              className="min-w-[80px] flex-1 bg-transparent text-sm text-[#efeff1] outline-none placeholder:text-[#53535f]"
            />
          </div>
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-xs text-[#adadb8]">Zakreplangan xabar</label>
          <div className="flex min-w-0 gap-2">
            <input
              type="text"
              value={pinnedMessage}
              onChange={(e) => setPinnedMessage(e.target.value)}
              className="box-border min-h-[40px] min-w-0 flex-1 rounded-md border border-[#26262c] bg-[#0e0e10] px-3 py-2 text-sm text-[#efeff1] outline-none focus:border-[#a970ff]/35"
              placeholder="Chat uchun pin"
            />
            <button
              type="button"
              onClick={() => setPinnedMessage((p) => p.trim())}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#26262c] text-[#adadb8] hover:bg-[#3e3e44] hover:text-[#bf94ff]"
              title="Pinni yangilash"
            >
              <Pin className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void regenerateKey()}
        disabled={busy}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#1f1f23] px-5 py-3 text-sm font-medium text-[#adadb8] transition hover:bg-[#26262c] hover:text-white disabled:opacity-50"
      >
        <RefreshCw size={15} aria-hidden />
        Yangi key
      </button>
    </div>
  );
}
