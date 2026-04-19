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
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-sm font-semibold transition-all pb-1",
                  activeTab === tab.id
                    ? "text-white border-b-2 border-white"
                    : "text-white/50 border-b-2 border-transparent hover:text-white/80"
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
    <div className="videos-page">
      {/* Tab bar */}
      <div className="videos-tab-bar">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn("videos-tab-btn", activeTab === tab.id && "active")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="videos-tab-content">
        {activeTab === 1 && <VideosTab />}
        {activeTab === 2 && <VideosTab />}
        {activeTab === 3 && <UsersTab />}
      </div>
    </div>
  );
}
