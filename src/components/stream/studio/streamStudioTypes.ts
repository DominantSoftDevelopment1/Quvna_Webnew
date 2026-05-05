import type { RefObject } from "react";
import type { StudioChatItem } from "@/components/stream/StudioChatPanel";

export type StreamStatus = "offline" | "waiting" | "live";

export type ChatRole = "viewer" | "owner" | "moderator";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  user: string;
  text: string;
  badge?: string;
  isHost?: boolean;
  isMe?: boolean;
  avatarHref?: string;
  subtitle?: string;
  sentAtMs?: number;
}

export interface StreamDto {
  id: string;
  restPathId: string;
  name?: string;
  isLive?: boolean;
  url?: string;
  fileId?: number;
  clickCount?: number;
}

/** Shell + children read controller fields from `useStreamStudio()` */
export type StreamStudioController = {
  profileUserId: number | null;
  profileData: unknown;
  profilePending: boolean;
  myDisplayName: string;
  setMyDisplayName: (v: string | ((p: string) => string)) => void;
  title: string;
  setTitle: (v: string | ((p: string) => string)) => void;
  game: string;
  setGame: (v: string | ((p: string) => string)) => void;
  /** Stream lifecycle UI */
  status: StreamStatus;
  streamId: string | null;
  streamKey: string;
  liveUserCount: number;
  busy: boolean;
  error: string | null;
  setError: (e: string | null) => void;
  ownerMessage: string;
  setOwnerMessage: (v: string | ((p: string) => string)) => void;
  studioSocketHint: string | null;
  chatHistoryStatus: "loading" | "ready" | "failed";
  chatPanelError: string | null;
  setChatPanelError: (v: string | null) => void;
  watchCopied: boolean;
  hlsPlaying: boolean;
  overlayText: string;
  setOverlayText: (v: string | ((p: string) => string)) => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  serverUrl: string;
  createStream: () => Promise<void>;
  stopStream: () => Promise<void>;
  startLive: () => void;
  regenerateKey: () => Promise<void>;
  sendChat: (role: "owner" | "moderator", text: string) => void;
  copyWatchUrl: () => Promise<void>;
  studioChatItems: StudioChatItem[];
  isWaiting: boolean;
  isLive: boolean;
  viewerWatchUrl: string;
  profileAvatarSrc: string;
  profileNumericId: number | null;
  profileBio: string;
  showProfileAvatarSkeleton: boolean;
  settingsOpen: boolean;
  setSettingsOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  overlayImages: string[];
  setOverlayImages: (v: string[] | ((p: string[]) => string[])) => void;
  pinnedMessage: string;
  setPinnedMessage: (v: string | ((p: string) => string)) => void;
  hashtags: string[];
  setHashtags: (v: string[] | ((p: string[]) => string[])) => void;
  tagInput: string;
  setTagInput: (v: string | ((p: string) => string)) => void;
};
