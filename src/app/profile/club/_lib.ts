"use client";

export type ClubAttachment = { id?: number; preSignedUrl?: string | null; url?: string | null };

export type Club = {
  id: string;
  name?: string | null;
  address?: string | null;
  description?: string | null;
  locationUrl?: string | null;
  price?: number | string | null;
  phoneNumber?: string | null;
  capacity?: number | null;
  vipRoomsCount?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  isWorkingEveryday?: boolean | null;
  attachments?: ClubAttachment[] | null;
  createdBy?: { id?: number | string | null } | null;
};

export type ClubDraft = {
  name: string;
  description: string;
  address: string;
  locationUrl: string;
  phoneNumber: string;
  startTime: string;
  endTime: string;
  is24_7: boolean;
  capacity: string;
  vipRoomsCount: string;
  price: string;
  acceptTerms: boolean;
  imageUrls: string[];
};

export const EMPTY_DRAFT: ClubDraft = {
  name: "",
  description: "",
  address: "",
  locationUrl: "",
  phoneNumber: "",
  startTime: "",
  endTime: "",
  is24_7: false,
  capacity: "",
  vipRoomsCount: "",
  price: "",
  acceptTerms: false,
  imageUrls: [],
};

const DRAFT_KEY = "profile_club_draft_v1";

export function getClubDraft(): ClubDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<ClubDraft>;
    return { ...EMPTY_DRAFT, ...parsed };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function setClubDraft(partial: Partial<ClubDraft>) {
  if (typeof window === "undefined") return;
  const merged = { ...getClubDraft(), ...partial };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
}

export function clearClubDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

