"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BottomActions, ClubShell, StepProgress } from "../../_components";
import { clearClubDraft, getClubDraft, setClubDraft, type ClubDraft } from "../../_lib";

export default function ClubCreateStep5Page() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get("mode");
  const clubId = search.get("id");
  const isEdit = mode === "edit" && Boolean(clubId);
  const [draft, setDraft] = useState<ClubDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(getClubDraft());
  }, []);

  async function submit() {
    if (!draft) return;
    if (!draft.acceptTerms) {
      setError("Shartlarga rozilikni belgilang.");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        name: draft.name,
        description: draft.description,
        address: draft.address,
        locationUrl: draft.locationUrl,
        capacity: Number(draft.capacity || 0),
        vipRoomsCount: Number(draft.vipRoomsCount || 0),
        startTime: draft.is24_7 ? "" : draft.startTime,
        endTime: draft.is24_7 ? "" : draft.endTime,
        isWorkingEveryday: draft.is24_7,
        price: draft.price.replaceAll(" ", ""),
        phoneNumber: draft.phoneNumber,
        attachmentId: [],
      };

      if (isEdit && clubId) await api.put(`/game-zone/update/${clubId}`, payload);
      else await api.post("/game-zone", payload);

      clearClubDraft();
      router.push("/profile/club");
    } catch {
      setError("Saqlashda xatolik. Backendda region yoki rol cheklovi bo'lishi mumkin.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!draft) return null;

  return (
    <ClubShell title="Klub qo'shish">
      <StepProgress current={5} />
      <h2 style={{ margin: "0 0 10px", fontSize: 40, lineHeight: "44px", color: "#2c3446", fontWeight: 700 }}>Tasdiqlash</h2>

      <div style={{ width: "100%", height: 138, borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)", background: draft.imageUrls[0] ? `url(${draft.imageUrls[0]}) center/cover no-repeat` : "#1e2230" }} />
      <p style={{ margin: "8px 0 0", fontSize: 16, fontWeight: 600 }}>{draft.name || "EMPIRE Gaming Club"}</p>

      <div style={{ marginTop: 8, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#181b24", padding: "10px", fontSize: 12 }}>
        <p style={{ margin: "0 0 6px", color: "#16f295", fontWeight: 700 }}>{Number(draft.price || 0).toLocaleString()} so'm</p>
        <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.75)" }}>Ish vaqti: {draft.is24_7 ? "24/7" : `${draft.startTime || "--:--"} dan ${draft.endTime || "--:--"} gacha`}</p>
        <p style={{ margin: 0, color: "rgba(255,255,255,0.75)" }}>Manzil: {draft.address || "-"}</p>
      </div>

      <p style={{ margin: "2px 0 0", fontSize: 13, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap" }}>{draft.description || "-"}</p>

      <div style={{ marginTop: 10, borderRadius: 12, border: `1px solid ${error && !draft.acceptTerms ? "#ef4444" : "rgba(255,255,255,0.1)"}`, background: "#181b24", padding: 10 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={draft.acceptTerms}
            onChange={(e) => {
              setDraft((prev) => (prev ? { ...prev, acceptTerms: e.target.checked } : prev));
              setClubDraft({ acceptTerms: e.target.checked });
            }}
          />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.82)" }}>
            Barcha shartlarni qabul qilaman
            <br />
            <span style={{ color: "rgba(255,255,255,0.58)" }}>
              Bu shartlarni qabul qilish orqali siz "Quvna" ilovasini barcha shartlariga roziligingizni bildirasiz.
              <span style={{ color: "#18ef97", fontWeight: 700 }}> Batafsil</span>
            </span>
          </span>
        </label>
      </div>

      {error ? <p style={{ margin: "8px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}
      <BottomActions
        onBack={() => router.push(`/profile/club/create/step-4${isEdit && clubId ? `?mode=edit&id=${clubId}` : ""}`)}
        onNext={() => void submit()}
        nextText={isSaving ? "Saqlanmoqda..." : "Tasdiqlash"}
        disabled={isSaving}
      />
    </ClubShell>
  );
}

