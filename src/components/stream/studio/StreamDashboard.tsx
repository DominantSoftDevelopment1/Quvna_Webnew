"use client";

import React from "react";

export function StreamPreview({ studio }: { studio: any }) {
  return (
    <div className="stream-preview-container">
      {/* video element controlled by the studio hook */}
      <video
        ref={studio?.videoRef}
        className="stream-preview-video"
        playsInline
        muted
        controls={false}
        preload="metadata"
      />
    </div>
  );
}

export function StreamStats({ studio }: { studio: any }) {
  return (
    <div className="stream-stats-card">
      <div>
        <div className="stream-stat-label">Ko'rib chiquvchilar</div>
        <div className="stream-stat-value">{studio?.liveUserCount ?? 0}</div>
      </div>

      <div>
        <div className="stream-stat-label">Status</div>
        <div className="stream-stat-value">{studio?.status ?? "offline"}</div>
      </div>

      <div>
        <div className="stream-stat-label">HLS manzil</div>
        <div className="text-[13px] text-zinc-300 truncate">{studio?.hlsUrl ?? "—"}</div>
      </div>
    </div>
  );
}

export function StreamControls({ studio }: { studio: any }) {
  const creating = studio?.busy ?? false;

  return (
    <div className="stream-controls-card">
      <button
        type="button"
        onClick={() => studio?.createStream?.()}
        className="stream-control-btn primary"
        disabled={creating}
      >
        Yaratish / Saqlash
      </button>

      <button
        type="button"
        onClick={() => studio?.startLive?.()}
        className="stream-control-btn secondary"
        disabled={!studio?.streamId || creating}
      >
        Efirni boshlash
      </button>

      <button
        type="button"
        onClick={() => studio?.stopStream?.()}
        className="stream-control-btn secondary"
        disabled={!studio?.streamId || creating}
      >
        Efirni to'xtatish
      </button>

      <button
        type="button"
        onClick={() => studio?.regenerateKey?.()}
        className="stream-control-btn secondary"
        disabled={creating}
      >
        Kalitni yangilash
      </button>

      <div className="mt-2 text-sm text-zinc-400">Title: {studio?.title}</div>
    </div>
  );
}

export function StreamAnalytics({ studio }: { studio: any }) {
  return (
    <div className="stream-analytics-section">
      <div className="stream-analytics-header">
        <div className="stream-analytics-title">Analytics (Real-time)</div>
        <div className="stream-analytics-tabs">
          <button className="stream-analytics-tab active">Real-time</button>
          <button className="stream-analytics-tab">5-min</button>
        </div>
      </div>

      <div className="stream-analytics-content">
        {/* Placeholder: chart will be implemented later */}
        <div className="h-40 w-full rounded-md bg-gradient-to-br from-[#0f1114] to-[#161619] border border-[#272729]" />
      </div>
    </div>
  );
}

export function StreamDashboard({ studio }: { studio: any }) {
  return (
    <div className="stream-video-area">
      <StreamPreview studio={studio} />

      <div className="stream-stats-controls-row">
        <StreamStats studio={studio} />
        <StreamControls studio={studio} />
      </div>

      <StreamAnalytics studio={studio} />
    </div>
  );
}
