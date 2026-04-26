"use client";

import { Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { BottomActions, ClubShell, StepProgress } from "../../_components";
import { getClubDraft, setClubDraft } from "../../_lib";

export default function ClubCreateStep4Page() {
  const router = useRouter();
  const search = useSearchParams();
  const mode = search.get("mode");
  const id = search.get("id");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  useEffect(() => {
    const draft = getClubDraft();
    setImages((draft.imageUrls ?? []).slice(0, 4));
  }, []);

  const slots = useMemo(() => Array.from({ length: 4 }, (_, idx) => images[idx] || null), [images]);

  function toDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    });
  }

  function openFilePicker(slotIndex: number) {
    setActiveSlot(slotIndex);
    fileInputRef.current?.click();
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm faylini tanlang.");
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await toDataUrl(file);
      setImages((prev) => {
        const next = [...prev];
        next[activeSlot] = dataUrl;
        return next.slice(0, 4);
      });
      setError(null);
    } catch {
      setError("Rasm yuklashda xatolik bo'ldi.");
    } finally {
      e.target.value = "";
    }
  }

  function next() {
    const selectedImages = images.filter(Boolean);
    if (selectedImages.length === 0) {
      setError("Kamida bitta rasm tanlang.");
      return;
    }
    setClubDraft({ imageUrls: selectedImages.slice(0, 4) });
    router.push(`/profile/club/create/step-5${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`);
  }

  return (
    <ClubShell title="Klub qo'shish">
      <StepProgress current={4} />
      <h2 style={{ margin: "0 0 10px", fontSize: 40, lineHeight: "44px", color: "#2c3446", fontWeight: 700 }}>Klub rasmi</h2>

      <div style={{ borderRadius: 16, border: "1px dashed rgba(255,255,255,0.28)", background: "#1f232d", minHeight: 136, padding: 12, boxSizing: "border-box" }}>
        <p style={{ margin: "0 0 10px", textAlign: "center", color: "#7c59f1", fontSize: 14, fontWeight: 600 }}>Rasmlarni tanlang</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
          {slots.map((url, index) => (
            <div key={index} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => openFilePicker(index)}
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 0,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: url ? `url(${url}) center/cover no-repeat` : "#1e2230",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
                aria-label={url ? `Rasmni almashtirish ${index + 1}` : `Rasm qo'shish ${index + 1}`}
              >
                {!url ? <Plus size={24} color="rgba(255,255,255,0.72)" /> : null}
              </button>
              {url ? (
                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => {
                      const next = [...prev];
                      next[index] = "";
                      return next;
                    })
                  }
                  style={{ position: "absolute", right: -4, top: -4, width: 18, height: 18, borderRadius: 999, border: "none", background: "rgba(0,0,0,0.6)", color: "#fff", cursor: "pointer" }}
                >
                  <X size={11} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
      </div>

      <div style={{ marginTop: 10, borderRadius: 10, background: "#20242d", border: "1px solid rgba(255,255,255,0.08)", padding: "8px 10px", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
        Tavsiya: Minimal 3 ta rasm qo'shing. Katta o'lchamli sifatli rasm tanlang.
      </div>

      {error ? <p style={{ margin: "8px 0 0", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}
      <BottomActions onBack={() => router.push(`/profile/club/create/step-3${mode === "edit" && id ? `?mode=edit&id=${id}` : ""}`)} onNext={next} />
    </ClubShell>
  );
}

