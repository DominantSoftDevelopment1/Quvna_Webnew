"use client";

import { useStreams } from "@/hooks/useMedia";
import { cdnUrl, formatCount } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";
import { Radio, Eye } from "lucide-react";

export default function StreamPage() {
  const { data: streams = [], isLoading } = useStreams();

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="flex items-center gap-2 mb-6">
        <Radio size={20} style={{ color: "var(--primary)" }} />
        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Jonli Efirlar
        </h1>
        {streams.length > 0 && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: "var(--primary)", color: "white" }}
          >
            {streams.length} jonli
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : streams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Radio size={48} style={{ color: "var(--text-muted)" }} />
          <p className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>
            Hozircha jonli efir yo'q
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Birozdan so'ng tekshirib ko'ring
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {streams.map((stream: StreamItem) => (
            <StreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      )}
    </div>
  );
}

function StreamCard({ stream }: { stream: StreamItem }) {
  return (
    <div className="cursor-pointer group">
      <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
        {stream.thumbnailUrl || stream.thumbnail ? (
          <img
            src={cdnUrl(stream.thumbnailUrl ?? stream.thumbnail)}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: "var(--bg-card2)" }}
          >
            <Radio size={36} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
        {/* LIVE badge */}
        <span
          className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded text-white"
          style={{ background: "#e53e3e" }}
        >
          JONLI
        </span>
        {stream.viewerCount != null && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
            <Eye size={10} />
            {formatCount(stream.viewerCount)}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {stream.user?.avatar && (
          <img
            src={cdnUrl(stream.user.avatar)}
            alt={stream.user.username}
            className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium line-clamp-2 leading-snug" style={{ color: "var(--text-primary)" }}>
            {stream.title}
          </p>
          {stream.user && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {stream.user.username ?? stream.user.fullName}
            </p>
          )}
          {stream.game && (
            <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--primary)" }}>
              {stream.game}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StreamItem {
  id: number;
  title: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  viewerCount?: number;
  game?: string;
  user?: { username?: string; fullName?: string; avatar?: string };
}
