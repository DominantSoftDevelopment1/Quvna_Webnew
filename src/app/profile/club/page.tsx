"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { ClubShell } from "./_components";
import { clearClubDraft, setClubDraft, type Club } from "./_lib";
import type { CSSProperties } from "react";

export default function ProfileMyClubPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionClub, setActionClub] = useState<Club | null>(null);
  const [confirmDeleteClub, setConfirmDeleteClub] = useState<Club | null>(null);

  useEffect(() => {
    void loadClubs();
  }, []);

  async function loadClubs() {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await api.get("/game-zone");
      const list: Club[] = Array.isArray(data?.data) ? data.data : [];
      setClubs(list);
    } catch {
      setError("Klublarni yuklab bo'lmadi.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/game-zone/${id}`);
      setClubs((prev) => prev.filter((club) => club.id !== id));
    } catch {
      setError("Klubni o'chirib bo'lmadi.");
    } finally {
      setConfirmDeleteClub(null);
      setActionClub(null);
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return clubs;
    return clubs.filter((club) => (club.name ?? "").toLowerCase().includes(search.toLowerCase()));
  }, [clubs, search]);

  function startCreate() {
    clearClubDraft();
    setClubDraft({ acceptTerms: false, imageUrls: [] });
  }

  function startEdit(club: Club) {
    setClubDraft({
      name: club.name ?? "",
      description: club.description ?? "",
      address: club.address ?? "",
      locationUrl: club.locationUrl ?? "",
      phoneNumber: club.phoneNumber ?? "",
      startTime: club.startTime ?? "",
      endTime: club.endTime ?? "",
      is24_7: Boolean(club.isWorkingEveryday),
      capacity: club.capacity != null ? String(club.capacity) : "",
      vipRoomsCount: club.vipRoomsCount != null ? String(club.vipRoomsCount) : "",
      price: club.price != null ? String(club.price) : "",
      imageUrls: (club.attachments ?? []).map((a) => a?.preSignedUrl || a?.url || "").filter(Boolean),
    });
  }

  return (
    <ClubShell title="Mening klubim" onHeaderBack={() => router.push("/profile")}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <div style={{ position: "relative" }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish"
            style={{
              width: "100%",
              minHeight: 38,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#161920",
              color: "#fff",
              outline: "none",
              padding: "8px 10px 8px 34px",
              boxSizing: "border-box",
              fontSize: 14,
            }}
          />
        </div>

        <Link href="/profile/club/create/step-1" onClick={startCreate} className="club-add-fab" aria-label="Yangi club qoshish">
          <Plus size={30} color="#fff" />
          <span className="club-add-tooltip">Yangi club qoshish</span>
        </Link>
      </div>

      <p style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 600 }}>Barcha klublarim • {filtered.length}</p>
      {error ? <p style={{ margin: "0 0 10px", color: "#fda4af", fontSize: 13 }}>{error}</p> : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, paddingBottom: 80 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ minHeight: 170, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
            ))
          : filtered.map((club) => {
              const image = club.attachments?.[0]?.preSignedUrl || club.attachments?.[0]?.url || "";
              return (
                <article key={club.id}>
                  <button
                    type="button"
                    onClick={() => setActionClub(club)}
                    style={{
                      width: "100%",
                      height: 138,
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: image ? `url(${image}) center/cover no-repeat` : "linear-gradient(140deg,#22263a,#171a23)",
                      cursor: "pointer",
                    }}
                  />
                  <p style={{ margin: "7px 0 0", fontSize: 16, fontWeight: 500 }}>{club.name || "EMPIRE Gaming Club"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.66)" }}>{club.address || "Farg'ona, Mustaqillik ko'chasi,11"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#16f295", fontWeight: 600 }}>
                    {Number(club.price ?? 57000).toLocaleString()} so'm/soat
                  </p>
                </article>
              );
            })}
      </section>

      {actionClub ? (
        <div style={centerOverlayStyle} onClick={() => setActionClub(null)}>
          <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
            <div style={sheetHandleStyle} />
            <Link
              href={`/profile/club/create/step-1?mode=edit&id=${actionClub.id}`}
              onClick={() => startEdit(actionClub)}
              style={sheetActionStyle}
            >
              Tahrirlash
            </Link>
            <button type="button" style={{ ...sheetActionButtonStyle, color: "#ef4444" }} onClick={() => setConfirmDeleteClub(actionClub)}>
              Klubni o'chirish
            </button>
          </div>
        </div>
      ) : null}

      {confirmDeleteClub ? (
        <div style={overlayStyle} onClick={() => setConfirmDeleteClub(null)}>
          <div style={confirmBoxStyle} onClick={(e) => e.stopPropagation()}>
            <div style={sheetHandleStyle} />
            <p style={{ margin: "6px 0 4px", fontSize: 32, lineHeight: "38px", textAlign: "center", color: "#8f96a3", fontWeight: 500 }}>
              Haqiqatdan ham klubni
              <br />
              o'chirmoqchimisz?
            </p>
            <p style={{ margin: 0, textAlign: "center", fontSize: 22, lineHeight: "31px", color: "#c7ccd4" }}>
              Klub ma'lumotlarni o'chirganingizdan keyin ularni qayta tiklab bo'lmaydi!
            </p>
            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button type="button" style={cancelBtnStyle} onClick={() => setConfirmDeleteClub(null)}>
                Ortga
              </button>
              <button type="button" style={deleteBtnStyle} onClick={() => void handleDelete(confirmDeleteClub.id)}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .club-add-fab {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: #1a1e27;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          position: relative;
          cursor: pointer;
        }
        .club-add-tooltip {
          position: absolute;
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
          background: #11141b;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 8px;
          padding: 6px 8px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-50%) translateX(4px);
          transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
          pointer-events: none;
          z-index: 8;
        }
        .club-add-fab:hover .club-add-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(-50%) translateX(0);
        }
      `}</style>
    </ClubShell>
  );
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(3,4,6,0.72)",
  zIndex: 60,
  display: "flex",
  alignItems: "flex-end",
};

const centerOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(3,4,6,0.72)",
  zIndex: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 12,
  boxSizing: "border-box",
};

const sheetStyle: CSSProperties = {
  width: "min(360px, 100%)",
  borderRadius: 12,
  background: "#1a1d24",
  border: "1px solid rgba(255,255,255,0.12)",
  padding: "8px 10px 10px",
};

const confirmBoxStyle: CSSProperties = {
  width: "100%",
  borderTopLeftRadius: 14,
  borderTopRightRadius: 14,
  background: "#1a1d24",
  borderTop: "1px solid rgba(255,255,255,0.12)",
  padding: "8px 10px calc(10px + env(safe-area-inset-bottom))",
};

const sheetHandleStyle: CSSProperties = {
  width: 30,
  height: 3,
  borderRadius: 999,
  background: "rgba(255,255,255,0.38)",
  margin: "0 auto 8px",
};

const sheetActionStyle: CSSProperties = {
  width: "100%",
  minHeight: 43,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  display: "inline-flex",
  alignItems: "center",
  padding: "0 12px",
  color: "#d7dde8",
  textDecoration: "none",
  fontSize: 15,
};

const sheetActionButtonStyle: CSSProperties = {
  width: "100%",
  minHeight: 43,
  marginTop: 8,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  display: "inline-flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: 15,
  cursor: "pointer",
};

const cancelBtnStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#e7eaf0",
  fontSize: 15,
  cursor: "pointer",
};

const deleteBtnStyle: CSSProperties = {
  minHeight: 42,
  borderRadius: 10,
  border: "none",
  background: "#ef4444",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};

