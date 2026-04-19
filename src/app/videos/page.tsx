"use client";

import { useState } from "react";
import { ShortsFullScreen } from "@/components/videos/ShortsFullScreen";
import { VideosTab } from "@/components/videos/VideosTab";
import { UsersTab } from "@/components/videos/UsersTab";
import { cn } from "@/lib/utils";

const tabs = [
  { id: 0, label: "Reels" },
  { id: 1, label: "Videolar" },
  { id: 2, label: "Efir" },
  { id: 3, label: "Akkauntlar" },
];

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState(0);

  if (activeTab === 0) {
    return (
      <div className="shorts-page-container">
        <div className="shorts-tabs-overlay">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-sm font-semibold transition-all pb-1 border-b-2",
                  activeTab === tab.id
                    ? "text-white border-white"
                    : "text-white/50 border-transparent hover:text-white/80"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <ShortsFullScreen />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tab bar — Instagram underline style */}
      <div className="flex sticky top-14 z-30 border-b border-[var(--border)] bg-[var(--bg-dark)] px-4 sm:px-6 gap-0 scrollbar-none overflow-x-auto">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-white text-white"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pt-5 pb-16">
        {activeTab === 1 && <VideosTab />}
        {activeTab === 2 && <VideosTab />}
        {activeTab === 3 && <UsersTab />}
      </div>
    </div>
  );
}
