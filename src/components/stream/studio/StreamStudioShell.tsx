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
  ChevronDown,
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
  const [streamKeyVisible, setStreamKeyVisible] = useState(false);

  // Streaming time counter (mock for now)
  const streamTime = studio.isLive ? "00:45:32" : "00:00:00";

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0e0e10] text-[#efeff1]">
      {/* Top Header Bar - Twitch/YouTube style */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#2f2f35] bg-[#18181b] px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#9147ff] to-[#772ce8]">
              <Radio size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">Stream Studio</span>
          </div>
          
          {/* Stream Status Indicator */}
          <div className="flex items-center gap-3 rounded-lg bg-[#1f1f23] px-3 py-1.5">
            {studio.isLive ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                  <span className="text-sm font-bold text-red-400">LIVE</span>
                </div>
                <div className="h-4 w-px bg-[#3f3f46]" />
                <div className="flex items-center gap-1.5 text-sm text-[#adadb8]">
                  <Clock size={14} />
                  <span className="font-mono">{streamTime}</span>
                </div>
              </>
            ) : studio.streamId ? (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span className="text-sm font-medium text-amber-400">Kutilmoqda</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-[#53535f]" />
                <span className="text-sm text-[#adadb8]">Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Viewer Count */}
          {studio.isLive && (
            <div className="flex items-center gap-1.5 rounded-lg bg-[#1f1f23] px-3 py-1.5">
              <Eye size={14} className="text-[#00f593]" />
              <span className="text-sm font-bold text-[#00f593]">{studio.liveUserCount}</span>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1f1f23] text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex min-h-0 flex-1">
        {/* Left Sidebar - Scenes & Sources */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-[#2f2f35] bg-[#18181b]">
          {/* Tabs */}
          <div className="flex border-b border-[#2f2f35]">
            {(["scenes", "sources", "audio"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "border-b-2 border-[#9147ff] text-white"
                    : "text-[#adadb8] hover:text-white"
                }`}
              >
                {tab === "scenes" ? "Sahnalar" : tab === "sources" ? "Manbalar" : "Audio"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "scenes" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border-2 border-[#9147ff] bg-[#9147ff]/10 p-3">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-[#9147ff]" />
                    <span className="text-sm font-medium">Asosiy sahna</span>
                  </div>
                  <MoreHorizontal size={16} className="text-[#adadb8]" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#1f1f23] p-3 hover:bg-[#2f2f35]">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-[#adadb8]" />
                    <span className="text-sm text-[#adadb8]">BRB sahna</span>
                  </div>
                  <MoreHorizontal size={16} className="text-[#53535f]" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#1f1f23] p-3 hover:bg-[#2f2f35]">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-[#adadb8]" />
                    <span className="text-sm text-[#adadb8]">Yakunlash</span>
                  </div>
                  <MoreHorizontal size={16} className="text-[#53535f]" />
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#3f3f46] py-3 text-sm text-[#adadb8] transition hover:border-[#9147ff] hover:text-white">
                  + Sahna qo'shish
                </button>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-[#1f1f23] p-3">
                  <div className="flex items-center gap-2">
                    <Camera size={16} className="text-[#00f593]" />
                    <span className="text-sm">Kamera</span>
                  </div>
                  <Eye size={14} className="text-[#00f593]" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#1f1f23] p-3">
                  <div className="flex items-center gap-2">
                    <MonitorSpeaker size={16} className="text-[#00b5ad]" />
                    <span className="text-sm">Ekran</span>
                  </div>
                  <Eye size={14} className="text-[#00f593]" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#1f1f23] p-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} className="text-[#f97316]" />
                    <span className="text-sm">Overlay</span>
                  </div>
                  <Eye size={14} className="text-[#00f593]" />
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#1f1f23] p-3">
                  <div className="flex items-center gap-2">
                    <Type size={16} className="text-[#a855f7]" />
                    <span className="text-sm">Matn</span>
                  </div>
                  <Eye size={14} className="text-[#53535f]" />
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#3f3f46] py-3 text-sm text-[#adadb8] transition hover:border-[#9147ff] hover:text-white">
                  + Manba qo'shish
                </button>
              </div>
            )}

            {activeTab === "audio" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#adadb8]">
                    <span>Mikrofon</span>
                    <span>-12 dB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic size={16} className="text-[#00f593]" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#2f2f35]">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#00f593] to-[#00b5ad]" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#adadb8]">
                    <span>Desktop Audio</span>
                    <span>-6 dB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 size={16} className="text-[#00b5ad]" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#2f2f35]">
                      <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-[#00b5ad] to-[#0ea5e9]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stream Info Card */}
          <div className="border-t border-[#2f2f35] p-3">
            <div className="rounded-lg bg-[#1f1f23] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-[#adadb8]">Stream Info</span>
                <button 
                  onClick={() => studio.setSettingsOpen(true)}
                  className="text-xs text-[#9147ff] hover:underline"
                >
                  Tahrirlash
                </button>
              </div>
              <p className="mb-1 truncate text-sm font-medium">{studio.title}</p>
              <p className="text-xs text-[#adadb8]">{studio.game}</p>
            </div>
          </div>
        </aside>

        {/* Center - Video Preview */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Video Preview Area */}
          <div className="relative flex-1 bg-black">
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
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                      <Loader2 size={32} className="animate-spin text-white/40" />
                    </div>
                    <p className="text-sm font-medium text-[#adadb8]">Stream kutilmoqda...</p>
                    <p className="mt-1 text-xs text-[#53535f]">OBS yoki boshqa dasturdan ulanishni kuting</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1f1f23]">
                  <Video size={40} className="text-[#53535f]" />
                </div>
                <p className="text-lg font-medium text-[#adadb8]">Stream yaratilmagan</p>
                <p className="mt-1 text-sm text-[#53535f]">Pastdagi tugma bilan streamni boshlang</p>
              </div>
            )}

            {/* Live Badge */}
            {studio.isLive && (
              <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-bold text-red-400">LIVE</span>
                <div className="h-3 w-px bg-white/20" />
                <span className="text-sm font-medium text-white">{studio.liveUserCount} tomoshabin</span>
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20">
                    <Maximize2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="flex h-20 shrink-0 items-center justify-between border-t border-[#2f2f35] bg-[#18181b] px-6">
            {/* Left - Stream Controls */}
            <div className="flex items-center gap-3">
              {!studio.streamId ? (
                <button
                  onClick={() => void studio.createStream()}
                  disabled={studio.busy}
                  className="flex h-12 items-center gap-2 rounded-lg bg-[#9147ff] px-6 text-sm font-bold text-white transition hover:bg-[#772ce8] disabled:opacity-50"
                >
                  {studio.busy ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Yaratilmoqda...
                    </>
                  ) : (
                    <>
                      <Radio size={18} />
                      Stream yaratish
                    </>
                  )}
                </button>
              ) : !studio.isLive ? (
                <>
                  <button
                    onClick={studio.startLive}
                    disabled={studio.busy}
                    className="flex h-12 items-center gap-2 rounded-lg bg-[#00f593] px-6 text-sm font-bold text-[#0e0e10] transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Radio size={18} />
                    Jonli boshlash
                  </button>
                  <button
                    onClick={() => void studio.stopStream()}
                    disabled={studio.busy}
                    className="flex h-12 items-center gap-2 rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 text-sm font-medium text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
                  >
                    Bekor qilish
                  </button>
                </>
              ) : (
                <button
                  onClick={() => void studio.stopStream()}
                  disabled={studio.busy}
                  className="flex h-12 items-center gap-2 rounded-lg bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={18} />
                  Streamni to'xtatish
                </button>
              )}
            </div>

            {/* Center - Quick Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[#adadb8]">
                <Wifi size={16} className={studio.isLive ? "text-[#00f593]" : ""} />
                <span className="text-sm">Sifat: {studio.isLive ? "Yaxshi" : "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-[#adadb8]">
                <Users size={16} />
                <span className="text-sm">{studio.liveUserCount} tomoshabin</span>
              </div>
            </div>

            {/* Right - Copy Stream Key */}
            <div className="flex items-center gap-3">
              {studio.streamId && (
                <>
                  <button
                    onClick={() => void studio.copyWatchUrl()}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#1f1f23] px-4 text-sm text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
                  >
                    {studio.watchCopied ? (
                      <Check size={16} className="text-[#00f593]" />
                    ) : (
                      <Copy size={16} />
                    )}
                    Havola
                  </button>
                  {studio.viewerWatchUrl && (
                    <a
                      href={studio.viewerWatchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1f1f23] text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Error Display */}
          {studio.error && (
            <div className="flex items-center gap-2 border-t border-red-500/20 bg-red-500/10 px-4 py-2">
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-sm text-red-400">{studio.error}</p>
            </div>
          )}
        </main>

        {/* Right Sidebar - Chat */}
        <aside className="flex w-96 shrink-0 flex-col border-l border-[#2f2f35] bg-[#18181b]">
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
          <div className="w-full max-w-2xl rounded-2xl border border-[#2f2f35] bg-[#18181b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2f2f35] p-4">
              <h2 className="text-lg font-bold">Stream sozlamalari</h2>
              <button
                onClick={() => {
                  setShowSettings(false);
                  studio.setSettingsOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Stream Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#adadb8]">Stream nomi</label>
                  <input
                    type="text"
                    value={studio.title}
                    onChange={(e) => studio.setTitle(e.target.value)}
                    className="w-full rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 py-3 text-white outline-none transition focus:border-[#9147ff]"
                    placeholder="Stream nomini kiriting..."
                  />
                </div>

                {/* Game/Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#adadb8]">Kategoriya</label>
                  <input
                    type="text"
                    value={studio.game}
                    onChange={(e) => studio.setGame(e.target.value)}
                    className="w-full rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 py-3 text-white outline-none transition focus:border-[#9147ff]"
                    placeholder="O'yin yoki kategoriya..."
                  />
                </div>

                {/* Stream Key */}
                {studio.streamId && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#adadb8]">Stream Key</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={streamKeyVisible ? "text" : "password"}
                          value={studio.streamKey}
                          readOnly
                          className="w-full rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 py-3 font-mono text-sm text-white outline-none"
                        />
                      </div>
                      <button
                        onClick={() => setStreamKeyVisible(!streamKeyVisible)}
                        className="rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
                      >
                        {streamKeyVisible ? <VolumeX size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(studio.streamKey);
                        }}
                        className="rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* RTMP Server URL */}
                {studio.streamId && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#adadb8]">Server URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studio.serverUrl}
                        readOnly
                        className="flex-1 rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 py-3 font-mono text-sm text-white outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(studio.serverUrl);
                        }}
                        className="rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Pinned Message */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#adadb8]">Zakreplangan xabar</label>
                  <textarea
                    value={studio.pinnedMessage}
                    onChange={(e) => studio.setPinnedMessage(e.target.value)}
                    className="w-full rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-4 py-3 text-white outline-none transition focus:border-[#9147ff]"
                    rows={3}
                    placeholder="Tomoshabinlarga ko'rsatiladigan xabar..."
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#2f2f35] p-4">
              <button
                onClick={() => {
                  setShowSettings(false);
                  studio.setSettingsOpen(false);
                }}
                className="rounded-lg border border-[#3f3f46] bg-[#1f1f23] px-6 py-2.5 text-sm font-medium text-[#adadb8] transition hover:bg-[#2f2f35] hover:text-white"
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  studio.setSettingsOpen(false);
                }}
                className="rounded-lg bg-[#9147ff] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#772ce8]"
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
