"use client";

import { useState } from "react";
import { ShortsFullScreen } from "@/components/videos/ShortsFullScreen";
import { VideosTab } from "@/components/videos/VideosTab";
import { UsersTab } from "@/components/videos/UsersTab";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const tabs = [
  { id: 0, label: "Shorts" },
  { id: 1, label: "Foydalanuvchilar" },
  { id: 2, label: "Jonli efir" },
  { id: 3, label: "Video" },
];

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Shorts tab - fullscreen TikTok style WITH sidebar visible
  if (activeTab === 0) {
    return (
      <div className="shorts-page-container">
        {/* Tabs overlay at top */}
        <div className="shorts-tabs-overlay">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "text-sm font-medium transition-all pb-1 border-b-2",
                  activeTab === tab.id
                    ? "text-white border-white"
                    : "text-white/60 border-transparent hover:text-white/80"
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
    <div className="max-w-7xl mx-auto py-4">
      {/* Search */}
      <div
        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm mb-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <Search size={18} style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          placeholder="Video yoki foydalanuvchi qidirish..."
          className="bg-transparent flex-1 outline-none text-sm"
          style={{ color: "var(--text-primary)" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium rounded-full whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "text-white shadow-lg"
                : "hover:opacity-80"
            )}
            style={
              activeTab === tab.id
                ? { background: "var(--primary)", color: "var(--primary-text)" }
                : { background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 1 && <UsersTab />}
        {activeTab === 2 && <VideosTab />}
        {activeTab === 3 && <VideosTab />}
      </div>
    </div>
  );
}
