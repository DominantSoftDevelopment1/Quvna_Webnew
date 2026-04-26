"use client";

import { useEffect, useState } from "react";
import { ShortsFullScreen } from "@/components/videos/ShortsFullScreen";
import { VideoTermsModal } from "@/components/videos/VideoTermsModal";
import { Search } from "lucide-react";

export default function VideosPage() {
  const FIRST_VISIT_NOTICE_KEY = "video_terms_notice_seen_v1";
  const [activeTab, setActiveTab] = useState(0);
  const [showFirstVisitNotice, setShowFirstVisitNotice] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(FIRST_VISIT_NOTICE_KEY);
    if (!seen) {
      setShowFirstVisitNotice(true);
    }
  }, [FIRST_VISIT_NOTICE_KEY]);

  const closeFirstVisitNotice = () => {
    window.localStorage.setItem(FIRST_VISIT_NOTICE_KEY, "1");
    setShowFirstVisitNotice(false);
    setAcceptedTerms(true);
  };

  return (
    <>
      {activeTab === 0 ? (
        <div className="shorts-page-container">
          <div className="absolute top-3 right-4 z-50">
            <button type="button" aria-label="Qidirish" className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
              <Search size={18} className="text-white" />
            </button>
          </div>
          <ShortsFullScreen />
        </div>
      ) : (
        <div className="w-full px-[14px] pt-4 pb-20">
          <div className="mt-6 flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-24 h-24 rounded-lg bg-[#2a2a2a]" />
            <p className="text-white text-[18px] font-medium">Bu yer hozircha bo&apos;sh</p>
          </div>
        </div>
      )}
      <VideoTermsModal
        isOpen={activeTab === 0 && showFirstVisitNotice}
        accepted={acceptedTerms}
        onToggleAccepted={setAcceptedTerms}
        onAccept={closeFirstVisitNotice}
      />
    </>
  );
}
