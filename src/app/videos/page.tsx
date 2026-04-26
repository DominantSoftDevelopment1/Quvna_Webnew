"use client";

import { useEffect, useState } from "react";
import { ShortsFullScreen } from "@/components/videos/ShortsFullScreen";
import { VideoTermsModal } from "@/components/videos/VideoTermsModal";
import { Eye, Film, Heart, Plus, Search } from "lucide-react";

const PROHIBITED_CONTENT_CARDS = [
  {
    id: "adult",
    title: "+18 materiallar",
    icon: "/icons/prohibited/no-18.svg",
    details: "Kattalar uchun mo'ljallangan materiallarni joylash taqiqlanadi.",
  },
  {
    id: "gambling",
    title: "Qimor o'yinlari",
    icon: "/icons/prohibited/no-gambling.svg",
    details: "Qimor va pul tikishga undovchi kontent taqiqlanadi.",
  },
  {
    id: "hate",
    title: "Diniy va irqiy nizo",
    icon: "/icons/prohibited/no-hate.svg",
    details: "Diniy yoki irqiy adovat uyg'otuvchi kontent bloklanadi.",
  },
  {
    id: "substances",
    title: "Alkogol va tamaki",
    icon: "/icons/prohibited/no-alcohol.svg",
    details: "Alkogol va tamaki mahsulotlarini targ'ib qilish mumkin emas.",
  },
] as const;

export default function VideosPage() {
  const FIRST_VISIT_NOTICE_KEY = "video_terms_notice_seen_v1";
  const [activeTab, setActiveTab] = useState(0);
  const [showFirstVisitNotice, setShowFirstVisitNotice] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showRestrictionsCard, setShowRestrictionsCard] = useState(false);
  const [restrictionSeconds, setRestrictionSeconds] = useState(30);
  const [activeRestrictionId, setActiveRestrictionId] = useState<string | null>(null);

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
    setShowRestrictionsCard(true);
    setRestrictionSeconds(30);
    setActiveTab(1);
  };

  useEffect(() => {
    if (!showRestrictionsCard) return;
    const intervalId = window.setInterval(() => {
      setRestrictionSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          setShowRestrictionsCard(false);
          setActiveRestrictionId(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [showRestrictionsCard]);

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
          <div className="rounded-xl border border-white/10 bg-[#1c1c1c] p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <div className="flex items-center gap-1 text-[13px]"><Film size={14} className="text-[#1DBF73]" />54</div>
                <div className="flex items-center gap-1 text-[13px]"><Heart size={14} className="text-[#1DBF73]" />1 571</div>
                <div className="flex items-center gap-1 text-[13px]"><Eye size={14} className="text-[#1DBF73]" />1M</div>
              </div>
              <button className="rounded-md border border-[#333438] px-2 py-1 text-[12px] text-[#d5d7da] flex items-center gap-1">
                <Plus size={14} />Yaratish
              </button>
            </div>
          </div>

          {acceptedTerms && showRestrictionsCard && (
            <div style={{ width: "100%", boxSizing: "border-box", padding: "0 14px", marginTop: 16, marginBottom: 18 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: 18,
                  padding: "18px 16px 16px",
                  background: "rgba(24,24,26,0.96)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 16px 38px rgba(0,0,0,0.35)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    color: "#d1d1d6",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {restrictionSeconds}
                </div>
                <h3 style={{ margin: "0 36px 18px 0", color: "#fff", fontSize: 15, fontWeight: 700, lineHeight: "20px" }}>
                  Taqiqlangan kontentlar
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, width: "100%", boxSizing: "border-box" }}>
                  {PROHIBITED_CONTENT_CARDS.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setActiveRestrictionId(card.id)}
                      style={{
                        width: "100%",
                        minWidth: 0,
                        boxSizing: "border-box",
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <img src={card.icon} alt="" width={26} height={26} style={{ width: 26, height: 26, objectFit: "contain", display: "block" }} />
                      </div>
                      <p style={{ width: "100%", margin: 0, color: "#e5e5ea", fontSize: 11, lineHeight: "14px", textAlign: "center", whiteSpace: "normal", wordBreak: "normal" }}>
                        {card.title}
                      </p>
                    </button>
                  ))}
                </div>
                {activeRestrictionId && (
                  <div style={{ marginTop: 12, borderRadius: 12, border: "1px solid rgba(252,54,63,0.35)", background: "rgba(255,255,255,0.03)", padding: "10px 12px" }}>
                    <p style={{ margin: 0, color: "#FF8B92", fontSize: 12, fontWeight: 700 }}>
                      {PROHIBITED_CONTENT_CARDS.find((card) => card.id === activeRestrictionId)?.title}
                    </p>
                    <p style={{ margin: "6px 0 0", color: "#d5d7da", fontSize: 11, lineHeight: "15px" }}>
                      {PROHIBITED_CONTENT_CARDS.find((card) => card.id === activeRestrictionId)?.details}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-24 h-24 rounded-lg bg-[#2a2a2a]" />
            <p className="text-white text-[18px] font-medium">Bu yer hozircha bo&apos;sh</p>
          </div>
        </div>
      )}

      <div className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 w-[347px] max-w-[calc(100vw-24px)]">
        <div className="flex items-center gap-2 px-2">
          <button
            className={`flex-1 h-8 px-[14px] py-2 text-[12px] flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 0 ? "text-white border-[#03ff93]" : "text-[#717680] border-transparent"
            }`}
            onClick={() => setActiveTab(0)}
          >
            <img src="/icons/more-03.svg" alt="" width={16} height={16} className={activeTab === 0 ? "opacity-100" : "opacity-60"} />
            Umumiy
          </button>
          <button
            className={`flex-1 h-8 px-[14px] py-2 text-[12px] flex items-center justify-center gap-2 border-b-2 ${
              activeTab !== 0 ? "text-white border-[#03ff93]" : "text-[#717680] border-transparent"
            }`}
            onClick={() => setActiveTab(1)}
          >
            <img src="/icons/video-replay.svg" alt="" width={16} height={16} className={activeTab !== 0 ? "opacity-100" : "opacity-60"} />
            Videolarim
          </button>
        </div>
      </div>
      <VideoTermsModal
        isOpen={showFirstVisitNotice}
        accepted={acceptedTerms}
        onToggleAccepted={setAcceptedTerms}
        onAccept={closeFirstVisitNotice}
      />
    </>
  );
}
