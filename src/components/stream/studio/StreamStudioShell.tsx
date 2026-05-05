"use client";

import { useState } from "react";
import { useStreamStudio } from "@/hooks/useStreamStudio";
import { StudioChatPanel } from "@/components/stream/StudioChatPanel";
import {
  Radio,
  Settings,
  Copy,
  Check,
  Video,
  Mic,
  MonitorSpeaker,
  Users,
  Eye,
  Clock,
  Wifi,
  AlertCircle,
  MoreHorizontal,
  Maximize2,
  Volume2,
  VolumeX,
  Camera,
  Image as ImageIcon,
  Type,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

export type StreamStudioModel = ReturnType<typeof useStreamStudio>;

export function StreamStudioShell({ studio }: { studio: StreamStudioModel }) {
  const pinnedForChat = studio.pinnedMessage.trim() || studio.title.trim();
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"scenes" | "sources" | "audio">("scenes");
  const [isMuted, setIsMuted] = useState(false);

  // Streaming time counter (mock for now)
  const streamTime = studio.isLive ? "00:45:32" : "00:00:00";

  return (
    <div 
      className="flex h-screen w-full flex-col overflow-hidden"
      style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}
    >
      {/* Top Header Bar */}
      <header 
        className="flex h-16 shrink-0 items-center justify-between px-6"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "var(--primary-muted)" }}
            >
              <Radio size={20} style={{ color: "var(--primary)" }} />
            </div>
            <span className="text-xl font-bold">Stream Studio</span>
          </div>
          
          {/* Stream Status Indicator */}
          <div 
            className="flex items-center gap-3 rounded-xl px-4 py-2"
            style={{ background: "var(--bg-card2)" }}
          >
            {studio.isLive ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-pulse rounded-full" style={{ background: "var(--error)" }} />
                  <span className="text-sm font-bold" style={{ color: "var(--error)" }}>LIVE</span>
                </div>
                <div className="h-5 w-px" style={{ background: "var(--border)" }} />
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                  <Clock size={14} />
                  <span className="font-mono">{streamTime}</span>
                </div>
              </>
            ) : studio.streamId ? (
              <>
                <span className="h-3 w-3 rounded-full" style={{ background: "var(--warning)" }} />
                <span className="text-sm font-medium" style={{ color: "var(--warning)" }}>Kutilmoqda</span>
              </>
            ) : (
              <>
                <span className="h-3 w-3 rounded-full" style={{ background: "var(--text-inactive)" }} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Viewer Count */}
          {studio.isLive && (
            <div 
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: "var(--bg-card2)" }}
            >
              <Eye size={16} style={{ color: "var(--primary)" }} />
              <span className="text-sm font-bold" style={{ color: "var(--primary)" }}>{studio.liveUserCount}</span>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:opacity-80"
            style={{ background: "var(--bg-card2)", color: "var(--text-muted)" }}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Left Sidebar - Scenes & Sources */}
        <aside 
          className="flex w-80 shrink-0 flex-col"
          style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border)" }}
        >
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
            {(["scenes", "sources", "audio"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition"
                style={{
                  borderBottom: activeTab === tab ? "2px solid var(--primary)" : "2px solid transparent",
                  color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                {tab === "scenes" ? "Sahnalar" : tab === "sources" ? "Manbalar" : "Audio"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "scenes" && (
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between rounded-xl border-2 p-4"
                  style={{ borderColor: "var(--primary)", background: "var(--primary-muted)" }}
                >
                  <div className="flex items-center gap-3">
                    <Video size={18} style={{ color: "var(--primary)" }} />
                    <span className="font-medium">Asosiy sahna</span>
                  </div>
                  <MoreHorizontal size={18} style={{ color: "var(--text-muted)" }} />
                </div>
                <div 
                  className="flex items-center justify-between rounded-xl p-4 transition-colors hover:opacity-80 cursor-pointer"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="flex items-center gap-3">
                    <Video size={18} style={{ color: "var(--text-muted)" }} />
                    <span style={{ color: "var(--text-muted)" }}>BRB sahna</span>
                  </div>
                  <MoreHorizontal size={18} style={{ color: "var(--text-inactive)" }} />
                </div>
                <div 
                  className="flex items-center justify-between rounded-xl p-4 transition-colors hover:opacity-80 cursor-pointer"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="flex items-center gap-3">
                    <Video size={18} style={{ color: "var(--text-muted)" }} />
                    <span style={{ color: "var(--text-muted)" }}>Yakunlash</span>
                  </div>
                  <MoreHorizontal size={18} style={{ color: "var(--text-inactive)" }} />
                </div>
                <button 
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm transition hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  + Sahna qo&apos;shish
                </button>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="flex items-center gap-3">
                    <Camera size={18} style={{ color: "var(--primary)" }} />
                    <span>Kamera</span>
                  </div>
                  <Eye size={16} style={{ color: "var(--primary)" }} />
                </div>
                <div 
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="flex items-center gap-3">
                    <MonitorSpeaker size={18} style={{ color: "#00b5ad" }} />
                    <span>Ekran</span>
                  </div>
                  <Eye size={16} style={{ color: "var(--primary)" }} />
                </div>
                <div 
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="flex items-center gap-3">
                    <ImageIcon size={18} style={{ color: "#f97316" }} />
                    <span>Overlay</span>
                  </div>
                  <Eye size={16} style={{ color: "var(--primary)" }} />
                </div>
                <div 
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="flex items-center gap-3">
                    <Type size={18} style={{ color: "#a855f7" }} />
                    <span>Matn</span>
                  </div>
                  <Eye size={16} style={{ color: "var(--text-inactive)" }} />
                </div>
                <button 
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-4 text-sm transition hover:opacity-80"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                >
                  + Manba qo&apos;shish
                </button>
              </div>
            )}

            {activeTab === "audio" && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-muted)" }}>
                    <span>Mikrofon</span>
                    <span>-12 dB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mic size={18} style={{ color: "var(--primary)" }} />
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-card2)" }}>
                      <div 
                        className="h-full w-3/4 rounded-full"
                        style={{ background: "linear-gradient(to right, var(--primary), var(--primary-dark))" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm" style={{ color: "var(--text-muted)" }}>
                    <span>Desktop Audio</span>
                    <span>-6 dB</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} style={{ color: "#00b5ad" }} />
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-card2)" }}>
                      <div 
                        className="h-full w-1/2 rounded-full"
                        style={{ background: "linear-gradient(to right, #00b5ad, #0ea5e9)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stream Info Card */}
          <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="rounded-xl p-4" style={{ background: "var(--bg-card2)" }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Stream Info</span>
                <button 
                  onClick={() => studio.setSettingsOpen(true)}
                  className="text-xs hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Tahrirlash
                </button>
              </div>
              <p className="mb-1 truncate font-medium">{studio.title || "Stream nomi yo'q"}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{studio.game || "Kategoriya tanlanmagan"}</p>
            </div>
          </div>
        </aside>

        {/* Center - Video Preview */}
        <main className="flex min-w-0 flex-1 flex-col" style={{ background: "var(--bg-dark)" }}>
          {/* Video Preview Area */}
          <div className="relative flex-1" style={{ background: "#000" }}>
            {studio.streamId ? (
              <>
                <video
                  ref={studio.videoRef}
                  controls
                  autoPlay
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
                {!studio.hlsPlaying && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
                    <div 
                      className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                      style={{ background: "var(--bg-card2)" }}
                    >
                      <Loader2 size={36} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p className="text-lg font-medium" style={{ color: "var(--text-secondary)" }}>Stream kutilmoqda...</p>
                    <p className="mt-2 text-sm" style={{ color: "var(--text-inactive)" }}>OBS yoki boshqa dasturdan ulanishni kuting</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div 
                  className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <Video size={48} style={{ color: "var(--text-inactive)" }} />
                </div>
                <p className="text-xl font-medium" style={{ color: "var(--text-secondary)" }}>Stream yaratilmagan</p>
                <p className="mt-2 text-sm" style={{ color: "var(--text-inactive)" }}>Pastdagi tugma bilan streamni boshlang</p>
              </div>
            )}

            {/* Live Badge */}
            {studio.isLive && (
              <div className="absolute left-6 top-6 z-20 flex items-center gap-3 rounded-xl bg-black/60 px-4 py-2 backdrop-blur-sm">
                <span className="h-3 w-3 animate-pulse rounded-full" style={{ background: "var(--error)" }} />
                <span className="font-bold" style={{ color: "var(--error)" }}>LIVE</span>
                <div className="h-4 w-px bg-white/20" />
                <span className="font-medium text-white">{studio.liveUserCount} tomoshabin</span>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20">
                    <Maximize2 size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div 
            className="flex h-24 shrink-0 items-center justify-between px-8"
            style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}
          >
            {/* Left - Stream Controls */}
            <div className="flex items-center gap-4">
              {!studio.streamId ? (
                <button
                  onClick={() => void studio.createStream()}
                  disabled={studio.busy}
                  className="flex h-14 items-center gap-3 rounded-xl px-8 text-base font-bold transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--primary)", color: "var(--primary-text)" }}
                >
                  {studio.busy ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <Radio size={20} />
                      Stream yaratish
                    </>
                  )}
                </button>
              ) : !studio.isLive ? (
                <>
                  <button
                    onClick={studio.startLive}
                    disabled={studio.busy}
                    className="flex h-14 items-center gap-3 rounded-xl px-8 text-base font-bold transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: "var(--primary)", color: "var(--primary-text)" }}
                  >
                    <Radio size={20} />
                    Jonli boshlash
                  </button>
                  <button
                    onClick={() => void studio.stopStream()}
                    disabled={studio.busy}
                    className="flex h-14 items-center gap-3 rounded-xl px-6 text-base font-medium transition hover:opacity-80"
                    style={{ background: "var(--bg-card2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                  >
                    Bekor qilish
                  </button>
                </>
              ) : (
                <button
                  onClick={() => void studio.stopStream()}
                  disabled={studio.busy}
                  className="flex h-14 items-center gap-3 rounded-xl px-8 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--error)" }}
                >
                  <X size={20} />
                  Streamni to&apos;xtatish
                </button>
              )}
            </div>

            {/* Center - Quick Stats */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
                <Wifi size={18} style={{ color: studio.isLive ? "var(--primary)" : undefined }} />
                <span className="text-sm">Sifat: {studio.isLive ? "Yaxshi" : "—"}</span>
              </div>
              <div className="flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
                <Users size={18} />
                <span className="text-sm">{studio.liveUserCount} tomoshabin</span>
              </div>
            </div>

            {/* Right - Copy Stream Key */}
            <div className="flex items-center gap-4">
              {studio.streamId && (
                <>
                  <button
                    onClick={() => void studio.copyWatchUrl()}
                    className="flex h-12 items-center gap-3 rounded-xl px-5 text-sm transition hover:opacity-80"
                    style={{ background: "var(--bg-card2)", color: "var(--text-muted)" }}
                  >
                    {studio.watchCopied ? (
                      <Check size={18} style={{ color: "var(--primary)" }} />
                    ) : (
                      <Copy size={18} />
                    )}
                    Havola
                  </button>
                  {studio.viewerWatchUrl && (
                    <a
                      href={studio.viewerWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition hover:opacity-80"
                      style={{ background: "var(--bg-card2)", color: "var(--text-muted)" }}
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Error Display */}
          {studio.error && (
            <div 
              className="flex items-center gap-3 px-6 py-3"
              style={{ background: "rgba(252, 54, 63, 0.1)", borderTop: "1px solid rgba(252, 54, 63, 0.2)" }}
            >
              <AlertCircle size={18} style={{ color: "var(--error)" }} />
              <p className="text-sm" style={{ color: "var(--error)" }}>{studio.error}</p>
            </div>
          )}
        </main>

        {/* Right Sidebar - Chat */}
        <aside 
          className="flex w-[420px] shrink-0 flex-col"
          style={{ background: "var(--bg-card)", borderLeft: "1px solid var(--border)" }}
        >
          <StudioChatPanel
            className="h-full min-h-0 w-full rounded-none border-0"
            items={studio.studioChatItems}
            chatInput={studio.ownerMessage}
            onChatInputChange={(v) => {
              studio.setOwnerMessage(v);
              if (studio.chatPanelError) studio.setChatPanelError(null);
            }}
            onSend={() => studio.sendChat("owner", studio.ownerMessage)}
            pinnedText={pinnedForChat}
            liveUserCount={studio.liveUserCount}
            chatError={studio.chatPanelError}
            onDismissError={() => studio.setChatPanelError(null)}
            socketHint={studio.studioSocketHint}
            chatHistoryStatus={studio.chatHistoryStatus}
            emptyHint={studio.streamId ? "Hozircha xabar yo'q." : "Avval stream yarating."}
            emptySubhint={
              studio.streamId
                ? "Jonli efir yoki chat faol bo'lganda xabarlar shu yerda paydo bo'ladi."
                : "Chap panelda «Stream yaratish» tugmasi bilan stream oching."
            }
          />
        </aside>
      </div>

      {/* Settings Modal */}
      {(showSettings || studio.settingsOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div 
            className="w-full max-w-2xl rounded-2xl shadow-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div 
              className="flex items-center justify-between p-6"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2 className="text-xl font-bold">Stream Sozlamalari</h2>
              <button
                onClick={() => {
                  setShowSettings(false);
                  studio.setSettingsOpen(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:opacity-80"
                style={{ background: "var(--bg-card2)", color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Stream Title */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Stream nomi
                </label>
                <input
                  type="text"
                  value={studio.title}
                  onChange={(e) => studio.setTitle(e.target.value)}
                  placeholder="Stream nomini kiriting..."
                  className="w-full rounded-xl p-4 text-base outline-none transition focus:ring-2"
                  style={{ 
                    background: "var(--bg-card2)", 
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Kategoriya
                </label>
                <input
                  type="text"
                  value={studio.game}
                  onChange={(e) => studio.setGame(e.target.value)}
                  placeholder="O'yin yoki kategoriya..."
                  className="w-full rounded-xl p-4 text-base outline-none transition focus:ring-2"
                  style={{ 
                    background: "var(--bg-card2)", 
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              {/* Stream Key Info */}
              {studio.streamId && (
                <div 
                  className="rounded-xl p-5"
                  style={{ background: "var(--bg-card2)" }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Stream Key</span>
                    <button
                      onClick={() => void studio.copyStreamKey()}
                      className="flex items-center gap-2 text-sm transition hover:opacity-80"
                      style={{ color: "var(--primary)" }}
                    >
                      {studio.keyCopied ? <Check size={16} /> : <Copy size={16} />}
                      {studio.keyCopied ? "Nusxalandi" : "Nusxalash"}
                    </button>
                  </div>
                  <code 
                    className="block rounded-lg p-3 text-sm font-mono break-all"
                    style={{ background: "var(--bg-dark)", color: "var(--text-muted)" }}
                  >
                    {studio.streamKey || "Stream key mavjud emas"}
                  </code>
                  
                  <div className="mt-5">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>RTMP Server</span>
                    <code 
                      className="mt-2 block rounded-lg p-3 text-sm font-mono break-all"
                      style={{ background: "var(--bg-dark)", color: "var(--text-muted)" }}
                    >
                      {studio.rtmpUrl || "RTMP URL mavjud emas"}
                    </code>
                  </div>
                </div>
              )}
            </div>

            <div 
              className="flex justify-end gap-4 p-6"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <button
                onClick={() => {
                  setShowSettings(false);
                  studio.setSettingsOpen(false);
                }}
                className="h-12 rounded-xl px-6 font-medium transition hover:opacity-80"
                style={{ background: "var(--bg-card2)", color: "var(--text-muted)" }}
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  studio.setSettingsOpen(false);
                }}
                className="h-12 rounded-xl px-6 font-bold transition hover:opacity-90"
                style={{ background: "var(--primary)", color: "var(--primary-text)" }}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
