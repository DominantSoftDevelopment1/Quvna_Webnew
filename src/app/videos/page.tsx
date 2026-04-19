"use client";

import { useState } from "react";
import { ShortsFullScreen } from "@/components/videos/ShortsFullScreen";
import { VideosTab } from "@/components/videos/VideosTab";
import { UsersTab } from "@/components/videos/UsersTab";

const tabs = [
  { id: 0 },
  { id: 1 },
  { id: 2 },
  { id: 3 },
];

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState(0);

  if (activeTab === 0) {
    return (
      <div className="shorts-page-container">
        {/* Search icon — top right */}
        <div className="absolute top-3 right-4 z-50">
          <button type="button" aria-label="Qidirish" className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
            <img src="/icons/search.svg" alt="" width={18} height={18} className="icon-invert" />
          </button>
        </div>
        <ShortsFullScreen />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 pt-5 pb-16">
        {activeTab === 1 && <VideosTab />}
        {activeTab === 2 && <VideosTab />}
        {activeTab === 3 && <UsersTab />}
      </div>
    </div>
  );
}
