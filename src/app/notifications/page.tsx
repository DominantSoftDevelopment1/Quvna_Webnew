"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  usePersonalNotifications,
  useSystemNotifications,
  useMarkAllRead,
  type Notification,
  type SystemNotification,
} from "@/hooks/useNotifications";
import { cdnUrl } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  STREAM:  "notif-badge-stream",
  FOLLOW:  "notif-badge-follow",
  COMMENT: "notif-badge-comment",
  VIDEO:   "notif-badge-video",
};
const TYPE_LABELS: Record<string, string> = {
  STREAM: "Efir", FOLLOW: "Obuna", COMMENT: "Izoh", VIDEO: "Video",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Hozir";
  if (m < 60) return `${m} daq oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"personal" | "system">("personal");
  const { data: personal = [], isLoading: loadP } = usePersonalNotifications();
  const { data: system = [], isLoading: loadS } = useSystemNotifications();
  const markAll = useMarkAllRead();

  const unread = personal.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="notif-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <h1 className="notif-header-title">Bildirishnomalar</h1>
        {unread > 0 && (
          <button type="button" className="notif-read-all-btn" onClick={() => markAll.mutate()}>
            Barchasini o'qish
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="notif-tabs">
        <button type="button" className={`notif-tab${tab === "personal" ? " active" : ""}`} onClick={() => setTab("personal")}>
          <img src="/icons/notification.svg" alt="" width={16} height={16} className="icon-current" />
          Shaxsiy
          {unread > 0 && <span className="notif-tab-badge">{unread}</span>}
        </button>
        <button type="button" className={`notif-tab${tab === "system" ? " active" : ""}`} onClick={() => setTab("system")}>
          <img src="/icons/internet.svg" alt="" width={16} height={16} className="icon-current" />
          Umumiy
        </button>
      </div>

      {/* Personal */}
      {tab === "personal" && (
        loadP ? <NotifSkeletons /> :
        personal.length === 0 ? <Empty /> :
        <div className="mt-3 flex flex-col gap-2">
          {personal.map((n) => <PersonalItem key={n.id} n={n} />)}
        </div>
      )}

      {/* System */}
      {tab === "system" && (
        loadS ? <NotifSkeletons /> :
        system.length === 0 ? <Empty /> :
        <div className="mt-3 flex flex-col gap-2">
          {system.map((n) => <SystemItem key={n.id} n={n} />)}
        </div>
      )}
    </div>
  );
}

function PersonalItem({ n }: { n: Notification }) {
  const avatar = n.followFromDTO?.attachmentResponseDTO?.preSignedUrl;
  const name = n.followFromDTO?.fullName ?? n.followFromDTO?.username;
  const badgeCls = TYPE_COLORS[n.type ?? ""] ?? "notif-badge-default";
  const label = TYPE_LABELS[n.type ?? ""] ?? n.type ?? "";

  return (
    <div className={`notif-item${n.isRead ? "" : " unread"}`}>
      <div className="notif-avatar-wrap">
        {avatar ? (
          <img src={cdnUrl(avatar)} alt="" className="notif-avatar" />
        ) : (
          <div className={`notif-avatar-placeholder ${badgeCls}`}>
            {name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        {label && <span className={`notif-type-badge ${badgeCls}`}>{label}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="notif-title line-clamp-1">{n.title}</p>
        {n.body && <p className="notif-body line-clamp-2">{n.body}</p>}
        {n.link && (
          <a href={n.link} className="notif-link">Batafsil →</a>
        )}
        <p className="notif-time">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.isRead && <span className="notif-dot" />}
    </div>
  );
}

function SystemItem({ n }: { n: SystemNotification }) {
  return (
    <div className="notif-item">
      {n.imageUrl && (
        <img src={cdnUrl(n.imageUrl)} alt="" className="notif-sys-img" />
      )}
      <div className="flex-1 min-w-0">
        <p className="notif-title line-clamp-1">{n.title}</p>
        {n.body && <p className="notif-body line-clamp-3">{n.body}</p>}
        {n.link && <a href={n.link} className="notif-link">Batafsil →</a>}
        <p className="notif-time">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  );
}

function NotifSkeletons() {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {[0,1,2,3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  );
}

function Empty() {
  return <p className="mt-6 text-sm text-muted">Bildirishnomalar yo'q</p>;
}
