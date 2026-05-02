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

export type ParsedChatLine = {
  id: string;
  user: string;
  text: string;
  /** Yuboruvchi akkaunt ID (solishtirish uchun). */
  senderUserId?: number;
  /** Server bergan "strim egasi" bayrog'i (bo'lsa). */
  isStreamOwnerHint?: boolean;
};

/** REST `streamChat`/DTO formatlarini `parseStreamChatInbound` ga moslashtirish. */
export function normalizeChatRecordForParse(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };

  const asUser =
    (typeof raw.user === "object" && raw.user !== null ? raw.user : null) ??
    (typeof raw.userResponseDTO === "object" && raw.userResponseDTO !== null ? raw.userResponseDTO : null) ??
    (typeof raw.senderUserResponseDTO === "object" && raw.senderUserResponseDTO !== null
      ? raw.senderUserResponseDTO
      : null) ??
    null;

  if (!out.user && asUser !== null) {
    out.user = asUser;
  }

  const preferred =
    readNonEmptyString(raw.username) ||
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
          first_name?: unknown;
          fullName?: unknown;
          full_name?: unknown;
          displayName?: unknown;
          display_name?: unknown;
          name?: unknown;
        })
      : undefined;

  const fromUserObj =
    readNonEmptyString(u?.username) ||
    readNonEmptyString(u?.userName) ||
    readNonEmptyString(u?.user_name) ||
    readNonEmptyString(u?.nickname) ||
    readNonEmptyString(u?.displayName) ||
    readNonEmptyString(u?.display_name) ||
    readNonEmptyString(u?.fullName) ||
    readNonEmptyString(u?.full_name) ||
    readNonEmptyString(u?.name) ||
    readNonEmptyString(u?.firstName) ||
    readNonEmptyString(u?.first_name);

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

  return {
    id: String(raw.id ?? `${Date.now()}-${Math.random()}`),
    user,
    text: textCandidate,
    ...(senderUserId != null ? { senderUserId } : {}),
    ...(isStreamOwnerHint ? { isStreamOwnerHint } : {}),
  };
}

/** Kiruvchi chat qatori strim egasidan ekanini aniqlash (client ma'lumotlari bilan). */
export function inferLineIsStreamHost(line: ParsedChatLine, streamOwnerUserId?: number | null): boolean {
  if (line.isStreamOwnerHint) return true;
  if (streamOwnerUserId != null && line.senderUserId != null && line.senderUserId === streamOwnerUserId) {
    return true;
  }
  return false;
}
