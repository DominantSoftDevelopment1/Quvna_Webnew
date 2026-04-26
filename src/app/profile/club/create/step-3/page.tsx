"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { BottomActions, cardInputStyle, ClubShell, StepProgress } from "../../_components";
import { getClubDraft, setClubDraft } from "../../_lib";
import type { CSSProperties } from "react";

function ClubCreateStep3Content() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get("mode");
  const id = search.get("id");
  const [capacity, setCapacity] = useState("");
  const [vipRoomsCount, setVipRoomsCount] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = getClubDraft();
    setCapacity(draft.capacity);
    setVipRoomsCount(draft.vipRoomsCount);
    setPrice(draft.price);
  }, []);

  function next() {
    if (!capacity.trim() || !vipRoomsCount.trim() || !price.trim()) {
      setError("Tafsilot maydonlarini to'ldiring.");
      return;
    }
    setClubDraft({
      capacity: capacity.trim(),
      vipRoomsCount: vipRoomsCount.trim(),
      price: price.trim(),
    });
    router.push(`/profile/club/create/step-4${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`);
  }

  return (
    <ClubShell title="Klub qo'shish">
      <StepProgress current={3} />
      <h2 style={{ margin: "0 0 10px", fontSize: 40, lineHeight: "44px", color: "#2c3446", fontWeight: 700 }}>Tafsilotlar</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <label style={labelStyle}>Xonalar soni</label>
          <input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="0" style={cardInputStyle} />
        </div>
        <div>
          <label style={labelStyle}>VIP zallar</label>
          <input value={vipRoomsCount} onChange={(e) => setVipRoomsCount(e.target.value)} placeholder="0" style={cardInputStyle} />
        </div>
      </div>

      <label style={{ ...labelStyle, marginTop: 8 }}>Kirish Narxi (1 soat uchun)</label>
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Narxni kiriting" style={cardInputStyle} />
      {error ? <p style={{ margin: "8px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}

      <BottomActions onBack={() => router.push(`/profile/club/create/step-2${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`)} onNext={next} />
    </ClubShell>
  );
}

export default function ClubCreateStep3Page() {
  return (
    <Suspense fallback={null}>
      <ClubCreateStep3Content />
    </Suspense>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  margin: "0 0 4px",
  color: "rgba(255,255,255,0.66)",
  fontSize: 13,
};

