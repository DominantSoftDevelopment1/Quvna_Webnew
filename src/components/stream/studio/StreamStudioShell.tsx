"use client";

import { useStreamStudio } from "@/hooks/useStreamStudio";
import { StudioChatPanel } from "@/components/stream/StudioChatPanel";
import { StreamStudioHeader } from "@/components/stream/studio/StreamStudioHeader";
import { StreamStudioViewport } from "@/components/stream/studio/StreamStudioViewport";
import { StreamStudioControlStrip } from "@/components/stream/studio/StreamStudioControlStrip";
import { StreamStudioStreamerBar } from "@/components/stream/studio/StreamStudioStreamerBar";
import { StreamStudioSettingsPanel } from "@/components/stream/studio/StreamStudioSettingsPanel";

export type StreamStudioModel = ReturnType<typeof useStreamStudio>;

export function StreamStudioShell({ studio }: { studio: StreamStudioModel }) {
  const pinnedForChat = studio.pinnedMessage.trim() || studio.title.trim();

  return (
    <div
      data-stream-studio-page
      className="box-border flex min-h-0 w-full min-w-0 flex-col bg-[#0e0e10] text-[#efeff1] antialiased"
    >
      {/* Header (full width) */}
      <StreamStudioHeader
        isLive={studio.isLive}
        isWaiting={studio.isWaiting}
        liveUserCount={studio.liveUserCount}
        settingsOpen={studio.settingsOpen}
        setSettingsOpen={studio.setSettingsOpen}
      />

      {/* Main Grid: 2-column (video + chat) */}
      <div className="stream-studio-grid">
        
        {/* LEFT: Video Area */}
        <div className="stream-video-area">
          
          {/* Video Preview */}
          <StreamStudioViewport
            videoRef={studio.videoRef}
            streamId={studio.streamId}
            hlsPlaying={studio.hlsPlaying}
            isLive={studio.isLive}
            isWaiting={studio.isWaiting}
            liveUserCount={studio.liveUserCount}
            overlayImages={studio.overlayImages}
            setOverlayImages={studio.setOverlayImages}
          />

          {/* Stats + Controls */}
          <div className="stream-stats-controls-row">
            {/* Control Strip */}
            <StreamStudioControlStrip
              streamId={studio.streamId}
              busy={studio.busy}
              isLive={studio.isLive}
              createStream={studio.createStream}
              stopStream={studio.stopStream}
              startLive={studio.startLive}
              watchCopied={studio.watchCopied}
              copyWatchUrl={studio.copyWatchUrl}
              viewerWatchUrl={studio.viewerWatchUrl}
              setSettingsOpen={studio.setSettingsOpen}
            />

            {/* Streamer Info Bar */}
            <StreamStudioStreamerBar
              myDisplayName={studio.myDisplayName}
              title={studio.title}
              game={studio.game}
              profileAvatarSrc={studio.profileAvatarSrc}
              showProfileAvatarSkeleton={studio.showProfileAvatarSkeleton}
              profileNumericId={studio.profileNumericId}
              profileBio={studio.profileBio}
              overlayText={studio.overlayText}
              setOverlayText={studio.setOverlayText}
              viewerWatchUrl={studio.viewerWatchUrl}
            />
          </div>

          {/* Settings Panel (if open) */}
          {studio.settingsOpen ? (
            <StreamStudioSettingsPanel
              streamId={studio.streamId}
              streamKey={studio.streamKey}
              serverUrl={studio.serverUrl}
              title={studio.title}
              setTitle={studio.setTitle}
              pinnedMessage={studio.pinnedMessage}
              setPinnedMessage={studio.setPinnedMessage}
              hashtags={studio.hashtags}
              setHashtags={studio.setHashtags}
              tagInput={studio.tagInput}
              setTagInput={studio.setTagInput}
              busy={studio.busy}
              regenerateKey={studio.regenerateKey}
              game={studio.game}
              setGame={studio.setGame}
            />
          ) : null}

          {/* Stream ID Display */}
          {studio.streamId ? (
            <div className="box-border border-t border-[#26262c] bg-[#18181b] px-4 py-3">
              <label className="mb-1 block text-xs text-[#adadb8]">Stream ID</label>
              <p className="break-all font-mono text-sm text-[#efeff1]">{studio.streamId}</p>
            </div>
          ) : null}

          {/* Error Message */}
          {studio.error ? (
            <div className="box-border shrink-0 border-t border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm font-medium text-red-400">{studio.error}</p>
            </div>
          ) : null}
        </div>

        {/* RIGHT: Chat Panel (420px) */}
        <div className="stream-chat-panel">
          <StudioChatPanel
            className="w-full flex-1 rounded-none border-0"
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
                ? "Jonli efir yoki chat faol bo'lganda xabarlar shu ro'yxatda paydo bo'ladi."
                : "Chap panelda «Yaratish» tugmasi bilan stream oching — shundan keyin chat yozish mumkin bo'ladi."
            }
          />
        </div>
      </div>
    </div>
  );
}
