"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomActions, cardInputStyle, ClubShell, StepProgress } from "../../_components";
import { getClubDraft, setClubDraft } from "../../_lib";

export default function ClubCreateStep1Page() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get("mode");
  const id = search.get("id");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = getClubDraft();
    setName(draft.name);
    setDescription(draft.description);
  }, []);

  function next() {
    if (!name.trim() || !description.trim()) {
      setError("Nom va tavsifni to'ldiring.");
      return;
    }
    setClubDraft({ name: name.trim(), description: description.trim() });
    router.push(`/profile/club/create/step-2${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`);
  }

  return (
    <ClubShell title="Klub qo'shish">
      <StepProgress current={1} />
      <h2 style={{ margin: "0 0 14px", fontSize: 36, color: "#2c3446", fontWeight: 700 }}>Asosiy Ma'lumotlar</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gaming Club Nomi" style={cardInputStyle} />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Tavsifi"
        style={{ ...cardInputStyle, marginTop: 10, minHeight: 160, resize: "none" }}
      />
      {error ? <p style={{ margin: "8px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}

      <BottomActions onBack={() => router.push("/profile/club")} onNext={next} />
    </ClubShell>
  );
}

