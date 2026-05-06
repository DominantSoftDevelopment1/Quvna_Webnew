"use client";

import React from "react";
import { StudioChatPanel } from "@/components/stream/StudioChatPanel";
import { StreamDashboard } from "./StreamDashboard";

export type StreamStudioShellProps = {
  studio: any;
};

export function StreamStudioShell({ studio }: StreamStudioShellProps) {
  const handleSend = () => {
    if (!studio) return;
    void studio.sendChat?.("owner", studio.ownerMessage ?? "");
  };

  return (
    <div className="stream-studio-grid" data-stream-studio-page>
      <StreamDashboard studio={studio} />

      {/* Chat panel — pass only the props StudioChatPanel needs */}
      <div className="stream-chat-panel">
        <StudioChatPanel
          items={studio?.studioChatItems ?? []}
          chatInput={studio?.ownerMessage ?? ""}
          onChatInputChange={(v: string) => studio?.setOwnerMessage?.(v)}
          onSend={handleSend}
          pinnedText={studio?.pinnedMessage ?? ""}
          liveUserCount={studio?.liveUserCount ?? 0}
          chatError={studio?.chatPanelError ?? null}
          onDismissError={() => studio?.setChatPanelError?.(null)}
          socketHint={studio?.studioSocketHint ?? null}
          chatHistoryStatus={studio?.chatHistoryStatus ?? "ready"}
          emptyHint={"Hozircha xabar yo'q."}
          emptySubhint={"Jonli efir boshlangach bu yerda muloqot ko‘rinadi."}
        />
      </div>
    </div>
  );
}
