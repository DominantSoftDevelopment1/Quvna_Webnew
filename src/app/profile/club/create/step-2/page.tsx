"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BottomActions, cardInputStyle, ClubShell, StepProgress } from "../../_components";
import { getClubDraft, setClubDraft } from "../../_lib";
import type { CSSProperties } from "react";

function ClubCreateStep2Content() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get("mode");
  const id = search.get("id");
  const [address, setAddress] = useState("");
  const [locationUrl, setLocationUrl] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [is24_7, setIs24_7] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = getClubDraft();
    setAddress(draft.address);
    setLocationUrl(draft.locationUrl);
    setPhoneNumber(draft.phoneNumber);
    setStartTime(draft.startTime);
    setEndTime(draft.endTime);
    setIs24_7(draft.is24_7);
  }, []);

  function next() {
    if (!address.trim() || !locationUrl.trim() || !phoneNumber.trim()) {
      setError("Manzil, URL va telefon raqamni to'ldiring.");
      return;
    }
    if (!is24_7 && (!startTime.trim() || !endTime.trim())) {
      setError("Ish vaqtini kiriting yoki 24/7 ni yoqing.");
      return;
    }
    setClubDraft({
      address: address.trim(),
      locationUrl: locationUrl.trim(),
      phoneNumber: phoneNumber.trim(),
      startTime: is24_7 ? "" : startTime.trim(),
      endTime: is24_7 ? "" : endTime.trim(),
      is24_7,
    });
    router.push(`/profile/club/create/step-3${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`);
  }

  return (
    <ClubShell title="Klub qo'shish">
      <StepProgress current={2} />
      <h2 style={{ margin: "0 0 10px", fontSize: 40, lineHeight: "44px", color: "#2c3446", fontWeight: 700 }}>Joylashuvi va aloqa</h2>

      <label style={labelStyle}>Manzil</label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Manzilni kiriting" style={cardInputStyle} />

      <label style={{ ...labelStyle, marginTop: 8 }}>Joylashi URL</label>
      <input value={locationUrl} onChange={(e) => setLocationUrl(e.target.value)} placeholder="Manzilni kiriting" style={cardInputStyle} />

      <label style={{ ...labelStyle, marginTop: 8 }}>Telefon raqam</label>
      <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Telefon raqamni kiriting" style={cardInputStyle} />

      <label style={{ ...labelStyle, marginTop: 8 }}>Ish vaqti</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
        <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="dan" style={cardInputStyle} disabled={is24_7} />
        <input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="gacha" style={cardInputStyle} disabled={is24_7} />
        <button type="button" onClick={() => setIs24_7((v) => !v)} style={{ ...cardInputStyle, cursor: "pointer", color: is24_7 ? "#fff" : "#8f97a6" }}>
          24/7 {is24_7 ? "●" : ""}
        </button>
      </div>

      {error ? <p style={{ margin: "8px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}
      <BottomActions onBack={() => router.push(`/profile/club/create/step-1${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`)} onNext={next} />
    </ClubShell>
  );
}

export default function ClubCreateStep2Page() {
  return (
    <Suspense fallback={null}>
      <ClubCreateStep2Content />
    </Suspense>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  margin: "0 0 4px",
  color: "rgba(255,255,255,0.66)",
  fontSize: 13,
};

