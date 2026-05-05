import { useAuthStore } from "@/store/auth.store";

/** Chat yuborish uchun foydalanuvchi ID (login / persist / fallback). */
export function getStoredStreamUserId(): number | null {
  if (typeof window === "undefined") return null;

  const fromStore = useAuthStore.getState().user?.id;
  if (fromStore != null && fromStore !== "") {
    const n = Number(fromStore);
    if (Number.isFinite(n) && n > 0) return n;
  }

  for (const key of ["userId", "user_id"] as const) {
    const n = Number(localStorage.getItem(key));
    if (Number.isFinite(n) && n > 0) return n;
  }

  try {
    const raw = localStorage.getItem("quvna-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { user?: { id?: unknown } };
    };
    const id = parsed.state?.user?.id;
    if (id != null) {
      const n = Number(id);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    /* ignore */
  }

  return null;
}

/** Chatda chiqadigan ko'rinadigan ism (akkaunt/store). */
export function getStoredStreamDisplayName(): string {
  if (typeof window === "undefined") return "Foydalanuvchi";

  const u = useAuthStore.getState().user;
  if (u) {
    const un = typeof u.username === "string" ? u.username.trim() : "";
    if (un) return un;
    const fn = typeof u.fullName === "string" ? u.fullName.trim() : "";
    if (fn) return fn;
    const first = typeof u.firstName === "string" ? u.firstName.trim() : "";
    const last = typeof u.lastName === "string" ? u.lastName.trim() : "";
    const both = `${first} ${last}`.trim();
    if (both) return both;
  }

  try {
    const parsed = JSON.parse(localStorage.getItem("quvna-auth") ?? "null") as {
      state?: { user?: { username?: string; firstName?: string; lastName?: string; fullName?: string } };
    };
    const du = parsed?.state?.user;
    if (du) {
      if (typeof du.username === "string" && du.username.trim()) return du.username.trim();
      if (typeof du.fullName === "string" && du.fullName.trim()) return du.fullName.trim();
      const a = typeof du.firstName === "string" ? du.firstName.trim() : "";
      const b = typeof du.lastName === "string" ? du.lastName.trim() : "";
      const c = `${a} ${b}`.trim();
      if (c) return c;
    }
  } catch {
    /* ignore */
  }

  return "Foydalanuvchi";
}

function coalescePositiveId(...candidates: unknown[]): number | undefined {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c) && c > 0) return c;
    if (typeof c === "string" && /^\d+$/.test(c)) {
      const n = Number(c);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return undefined;
}

function readNonEmptyString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s : undefined;
}

function readBoolTruthy(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

/** Foydalanuvchi obyektidan avatar URL/path (CDN uchun). */
export function resolveUserAvatarHref(user: Record<string, unknown> | undefined): string | undefined {
  if (!user) return undefined;
  const a = typeof user.avatar === "string" ? user.avatar.trim() : "";
  if (a) return a;
  const att = user.attachmentResponseDTO as Record<string, unknown> | undefined;
  const pre = typeof att?.preSignedUrl === "string" ? att.preSignedUrl.trim() : "";
  if (pre) return pre;
  const cur = typeof att?.contentURL === "string" ? att.contentURL.trim() : "";
  if (cur) return cur;
  const photo =
    typeof user.profileImage === "string"
      ? user.profileImage.trim()
      : typeof (user as { profile_image?: unknown }).profile_image === "string"
        ? String((user as { profile_image: string }).profile_image).trim()
        : "";
  return photo || undefined;
}

function resolveChatSubtitle(
  raw: Record<string, unknown>,
  uObj: Record<string, unknown> | undefined
): string | undefined {
  const pieces: string[] = [];
  const play =
    readNonEmptyString(uObj?.playName) ||
    readNonEmptyString(uObj?.play_name) ||
    readNonEmptyString(raw.playName);
  const gameId =
    readNonEmptyString(uObj?.gameID) ||
    readNonEmptyString(uObj?.game_id) ||
    readNonEmptyString(raw.gameID) ||
    readNonEmptyString(raw.game_id);
  const mlUid =
    readNonEmptyString(uObj?.mobileLegendsUID) || readNonEmptyString(uObj?.mobile_legends_u_i_d);
  const ffUid =
    readNonEmptyString(uObj?.freeFireUID) || readNonEmptyString(uObj?.free_fire_u_i_d);
  const steamId =
    readNonEmptyString(uObj?.steamId) ||
    readNonEmptyString(uObj?.steamUID) ||
    readNonEmptyString(uObj?.steam_id);

  if (play) pieces.push(play);
  if (gameId) pieces.push(`UID ${gameId}`);
  if (!gameId && mlUid) pieces.push(`ML UID ${mlUid}`);
  if (!gameId && !mlUid && ffUid) pieces.push(`FF UID ${ffUid}`);
  if (!gameId && !mlUid && !ffUid && steamId) pieces.push(`Steam ${steamId}`);

  return pieces.length ? pieces.join(" · ") : undefined;
}

export type ParsedChatLine = {
  id: string;
  user: string;
  text: string;
  /** Yuboruvchi akkaunt ID (solishtirish uchun). */
  senderUserId?: number;
  /** Server bergan "strim egasi" bayrog'i (bo'lsa). */
  isStreamOwnerHint?: boolean;
  /** Profil rasmi (CDN path yoki URL). */
  avatarHref?: string;
  /** Qo‘shimcha: nickname, PUBG UID va h.k. */
  subtitle?: string;
  /** Xabar vaqti (ms, epoch) — REST/WS DTO dan. */
  sentAtMs?: number;
};

function extractChatRecordTimestampMs(raw: Record<string, unknown>): number | undefined {
  const t = raw.createdAt ?? raw.updatedAt ?? raw.timestamp ?? raw.sentAt ?? raw.created_at;
  if (typeof t === "number" && Number.isFinite(t)) return t > 1e12 ? t : t * 1000;
  if (typeof t === "string") {
    const d = Date.parse(t);
    if (!Number.isNaN(d)) return d;
  }
  return undefined;
}

/** REST `streamChat`/DTO formatlarini `parseStreamChatInbound` ga moslashtirish. */
export function normalizeChatRecordForParse(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };

  const asUser =
    (typeof raw.user === "object" && raw.user !== null ? raw.user : null) ??
    (typeof raw.userResponseDTO === "object" && raw.userResponseDTO !== null ? raw.userResponseDTO : null) ??
    (typeof raw.senderUserResponseDTO === "object" && raw.senderUserResponseDTO !== null
      ? raw.senderUserResponseDTO
      : null) ??
    (typeof raw.senderUser === "object" && raw.senderUser !== null ? raw.senderUser : null) ??
    (typeof raw.sender === "object" && raw.sender !== null ? raw.sender : null) ??
    (typeof raw.fromUser === "object" && raw.fromUser !== null ? raw.fromUser : null) ??
    null;

  if (!out.user && asUser !== null) {
    out.user = asUser;
  }

  const preferred =
    readNonEmptyString(raw.username) ||
    readNonEmptyString(raw.nickname) ||
    readNonEmptyString(raw.nickName) ||
    readNonEmptyString(raw.senderNickname) ||
    readNonEmptyString(raw.sender_username) ||
    readNonEmptyString(raw.senderUsername) ||
    readNonEmptyString(raw.senderName) ||
    readNonEmptyString(raw.senderDisplayName) ||
    readNonEmptyString(raw.senderFullName) ||
    readNonEmptyString(raw.displayName) ||
    readNonEmptyString(raw.fullName) ||
    readNonEmptyString(raw.name) ||
    readNonEmptyString(raw.nickname) ||
    readNonEmptyString(raw.userName);

  if (!readNonEmptyString(out.username) && preferred) {
    out.username = preferred;
  }

  return out;
}

/**
 * WS xabarda `payload`/`data` ichida DTO bor bo'lsa uni tekislab `parseStreamChatInbound` uchun top-level bilan birlashtiradi.
 */
export function flattenStreamChatWsPayload(raw: Record<string, unknown>): Record<string, unknown> {
  const nestedKeys = ["payload", "data", "body", "chat", "dto", "streamChat", "chatMessage"];
  let merged: Record<string, unknown> = {};
  for (const key of nestedKeys) {
    const v = raw[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      merged = { ...merged, ...(v as Record<string, unknown>) };
    }
  }
  merged = { ...merged, ...raw };
  return normalizeChatRecordForParse(merged);
}

/** Backend keladigan WS JSON formatlarining turli-variantini birlashtirish. */
export function parseStreamChatInbound(raw: Record<string, unknown>): ParsedChatLine | null {
  const textCandidate =
    (typeof raw.message === "string" && raw.message) ||
    (typeof raw.text === "string" && raw.text) ||
    (typeof raw.content === "string" && raw.content) ||
    "";

  if (!textCandidate.trim()) return null;

  let user = "viewer";

  const userObjRaw = raw.user;
  const u =
    typeof userObjRaw === "object" && userObjRaw !== null
      ? (userObjRaw as {
          username?: unknown;
          userName?: unknown;
          user_name?: unknown;
          nickname?: unknown;
          firstName?: unknown;
          lastName?: unknown;
          first_name?: unknown;
          last_name?: unknown;
          fullName?: unknown;
          full_name?: unknown;
          displayName?: unknown;
          display_name?: unknown;
          name?: unknown;
        })
      : undefined;

  const fn = readNonEmptyString(u?.firstName) ?? readNonEmptyString(u?.first_name);
  const ln = readNonEmptyString(u?.lastName) ?? readNonEmptyString(u?.last_name);
  const fromParts = `${fn ?? ""} ${ln ?? ""}`.trim();

  const fromUserObj =
    readNonEmptyString(u?.nickname) ||
    readNonEmptyString(u?.fullName) ||
    readNonEmptyString(u?.full_name) ||
    readNonEmptyString(u?.username) ||
    readNonEmptyString(u?.userName) ||
    readNonEmptyString(u?.user_name) ||
    readNonEmptyString(u?.displayName) ||
    readNonEmptyString(u?.display_name) ||
    readNonEmptyString(u?.name) ||
    (fromParts.length ? fromParts : undefined);

  if (fromUserObj && fromUserObj.toLowerCase() !== "viewer") user = fromUserObj;

  if (user === "viewer") {
    const fromUserString = readNonEmptyString(userObjRaw);
    if (fromUserString && fromUserString.toLowerCase() !== "viewer") {
      user = fromUserString;
    }
  }

  if (user === "viewer") {
    const fromTopLevel =
      readNonEmptyString(raw.username) ||
      readNonEmptyString(raw.nickname) ||
      readNonEmptyString(raw.nickName) ||
      readNonEmptyString(raw.playName) ||
      readNonEmptyString(raw.senderNickname) ||
      readNonEmptyString(raw.senderName) ||
      readNonEmptyString(raw.senderUsername) ||
      readNonEmptyString(raw.sender_display_name) ||
      readNonEmptyString(raw.sender_full_name) ||
      readNonEmptyString(raw.sender_name) ||
      readNonEmptyString(raw.sender_username) ||
      readNonEmptyString(raw.displayName) ||
      readNonEmptyString(raw.fullName) ||
      readNonEmptyString(raw.name);
    if (fromTopLevel && fromTopLevel.toLowerCase() !== "viewer") user = fromTopLevel;
  }

  const uObj =
    typeof userObjRaw === "object" && userObjRaw !== null ? (userObjRaw as Record<string, unknown>) : undefined;

  const senderUserId = coalescePositiveId(
    raw.senderUserId,
    raw.senderId,
    raw.userId,
    raw.sender_user_id,
    raw.sender_userId,
    raw.senderID,
    raw.user_id,
    raw.userID,
    raw.accountId,
    raw.account_id,
    uObj?.userId,
    uObj?.user_id,
    uObj?.accountId,
    uObj?.account_id,
    uObj?.id
  );

  if (user.toLowerCase() === "viewer" && senderUserId != null) {
    user = `user_${senderUserId}`;
  }

  const roleStr = typeof raw.role === "string" ? raw.role.toLowerCase() : "";
  const isStreamOwnerHint =
    readBoolTruthy(raw.isStreamOwner) ||
    readBoolTruthy(raw.isOwner) ||
    readBoolTruthy(raw.isStreamer) ||
    readBoolTruthy(raw.streamOwner) ||
    roleStr === "owner" ||
    roleStr === "streamer";

  let avatarHref: string | undefined;
  if (uObj) avatarHref = resolveUserAvatarHref(uObj);
  if (!avatarHref) {
    avatarHref =
      readNonEmptyString(raw.senderAvatar) ||
      readNonEmptyString(raw.avatar) ||
      readNonEmptyString(raw.avatarUrl) ||
      readNonEmptyString(raw.avatar_url);
  }

  const subtitle = resolveChatSubtitle(raw, uObj);
  const sentAtMs = extractChatRecordTimestampMs(raw);

  return {
    id: String(raw.id ?? `${Date.now()}-${Math.random()}`),
    user,
    text: textCandidate,
    ...(senderUserId != null ? { senderUserId } : {}),
    ...(isStreamOwnerHint ? { isStreamOwnerHint } : {}),
    ...(avatarHref ? { avatarHref } : {}),
    ...(subtitle ? { subtitle } : {}),
    ...(sentAtMs != null ? { sentAtMs } : {}),
  };
}

/** Kiruvchi chat qatori strim egasidan ekanini aniqlash (client ma'lumotlari bilan). */
export function inferLineIsStreamHost(
  line: ParsedChatLine,
  streamOwnerUserId?: number | null,
  streamOwnerDisplayName?: string | null
): boolean {
  if (line.isStreamOwnerHint) return true;
  if (streamOwnerUserId != null && line.senderUserId != null && line.senderUserId === streamOwnerUserId) {
    return true;
  }
  const label = typeof streamOwnerDisplayName === "string" ? streamOwnerDisplayName.trim() : "";
  if (label.length > 0) {
    const cu = typeof line.user === "string" ? line.user.trim() : "";
    if (cu.length > 0 && cu.toLowerCase() === label.toLowerCase()) return true;
  }
  return false;
}
