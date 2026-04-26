"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, ChevronLeft, Pencil, Plus, Trophy, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { cdnUrl } from "@/lib/utils";

type TournamentItem = {
  id?: number | string;
  name?: string | null;
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  prizePool?: number | string | null;
  maxParticipants?: number | null;
  logo?: { preSignedUrl?: string | null; contentURL?: string | null } | null;
  imageUrl?: string | null;
  image?: string | null;
  description?: string | null;
  teamFormat?: string | null;
  maxMembersPerTeam?: number | null;
  hashtags?: string | null;
};

function dateLabel(value?: string | null): string {
  if (!value) return "Noma'lum sana";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Noma'lum sana";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((today - target) / 86400000);

  if (diffDays === 0) return "Bugun";
  if (diffDays === 1) return "Kecha";
  return d.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short" });
}

function rangeLabel(start?: string | null, end?: string | null): string {
  return `${dateLabel(start)} - ${dateLabel(end)}`;
}

export default function MyTournamentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TournamentItem | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: items = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["my-tournaments"],
    queryFn: async () => {
      const { data } = await api.get("/competition/my");
      const list = Array.isArray(data?.data) ? data.data : [];
      return list as TournamentItem[];
    },
  });

  const normalized = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        name: item.name || item.title || "Turnir",
        dateRange: rangeLabel(item.startDate, item.endDate),
        logo: item.logo?.preSignedUrl || item.logo?.contentURL || item.imageUrl || item.image || null,
        prizePool: item.prizePool != null ? Number(item.prizePool) : null,
        participants: item.maxParticipants ?? null,
      })),
    [items],
  );

  return (
    <div
      style={{
        minHeight: "calc(100dvh - 56px)",
        width: "100%",
        background: "radial-gradient(120% 100% at 10% 0%, #1f2937 0%, #0f172a 55%, #020617 100%)",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          padding: "12px 10px calc(20px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
          minHeight: "calc(100dvh - 56px)",
        }}
      >
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr auto",
            alignItems: "center",
            marginBottom: 12,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(14,19,28,0.55)",
            backdropFilter: "blur(12px)",
            padding: "8px 10px",
            gap: 8,
          }}
        >
          <Link
            href="/profile"
            aria-label="Orqaga"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(226,232,240,0.92)",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 style={{ margin: 0, textAlign: "center", fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.96)" }}>
            Mening turnirlarim
          </h1>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
            style={{
              minHeight: 32,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.92)",
              fontSize: 12,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "0 10px",
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Yaratish
          </button>
        </header>

        <div
          style={{
            width: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(8,12,20,0.58)",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
          {isLoading || isFetching ? (
            <div style={{ display: "grid", gap: 0 }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} style={{ padding: "16px", borderBottom: idx === 4 ? "none" : "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ height: 12, width: "52%", borderRadius: 6, background: "rgba(255,255,255,0.14)" }} />
                  <div style={{ marginTop: 10, height: 18, width: "70%", borderRadius: 6, background: "rgba(255,255,255,0.2)" }} />
                </div>
              ))}
            </div>
          ) : normalized.length === 0 ? (
            <div style={{ padding: "30px 16px", textAlign: "center" }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  margin: "0 auto",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trophy size={26} />
              </div>
              <p style={{ margin: "12px 0 4px", fontSize: 17, fontWeight: 700 }}>Turnirlar topilmadi</p>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.62)" }}>
                Profilingizga tegishli turnirlar shu yerda ko&apos;rinadi.
              </p>
            </div>
          ) : (
            <div style={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
              {normalized.map((item, idx) => (
                <article
                  key={`${item.id ?? "row"}-${idx}`}
                  style={{
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    padding: "16px",
                    borderBottom: idx === normalized.length - 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "82px 1fr", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 82,
                        height: 82,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.06)",
                      }}
                    >
                      {item.logo ? (
                        <img src={cdnUrl(item.logo)} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : null}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.64)" }}>{item.dateRange}</p>
                      <p style={{ margin: "5px 0 0", fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>{item.name}</p>

                      <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {item.participants ? (
                          <span
                            style={{
                              borderRadius: 999,
                              border: "1px solid rgba(255,255,255,0.14)",
                              background: "rgba(255,255,255,0.06)",
                              padding: "2px 8px",
                              fontSize: 11,
                              color: "rgba(255,255,255,0.85)",
                            }}
                          >
                            {item.participants} jamoa
                          </span>
                        ) : null}
                        {item.prizePool != null && Number.isFinite(item.prizePool) ? (
                          <span
                            style={{
                              borderRadius: 999,
                              border: "1px solid rgba(16,185,129,0.45)",
                              background: "rgba(16,185,129,0.12)",
                              padding: "2px 8px",
                              fontSize: 11,
                              color: "#6ee7b7",
                              fontWeight: 700,
                            }}
                          >
                            {item.prizePool.toLocaleString()} so&apos;m
                          </span>
                        ) : null}
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Link
                          href={`/tournaments/${item.id}`}
                          style={{
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.16)",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.92)",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "6px 10px",
                            textDecoration: "none",
                          }}
                        >
                          Turnir yutuqlari
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            const raw = items.find((r) => String(r.id) === String(item.id)) ?? null;
                            setEditingItem(raw);
                            setShowForm(true);
                          }}
                          style={{
                            borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.9)",
                            width: 31,
                            height: 31,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          aria-label="Turnirni tahrirlash"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (item.id == null) return;
                            const confirmed = window.confirm("Turnirni o'chirasizmi?");
                            if (!confirmed) return;
                            try {
                              await api.delete(`/competition/${item.id}`);
                              await queryClient.invalidateQueries({ queryKey: ["my-tournaments"] });
                            } catch {
                              window.alert("Turnirni o'chirib bo'lmadi.");
                            }
                          }}
                          style={{
                            borderRadius: 8,
                            border: "1px solid rgba(248,113,113,0.45)",
                            background: "rgba(127,29,29,0.28)",
                            color: "#fca5a5",
                            width: 31,
                            height: 31,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                          aria-label="Turnirni o'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      {showForm ? (
        <TournamentFormModal
          initial={editingItem}
          saving={saving}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSubmit={async (payload) => {
            try {
              setSaving(true);
              if (payload.mode === "create") {
                await api.post("/competition", payload.data);
              } else {
                await api.put(`/competition/${payload.id}`, { competition: payload.data });
              }
              await refetch();
              setShowForm(false);
              setEditingItem(null);
            } catch {
              window.alert("Turnirni saqlashda xatolik yuz berdi.");
            } finally {
              setSaving(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}

type SubmitPayload =
  | { mode: "create"; data: Record<string, unknown> }
  | { mode: "update"; id: number | string; data: Record<string, unknown> };

function TournamentFormModal({
  initial,
  onClose,
  onSubmit,
  saving,
}: {
  initial: TournamentItem | null;
  onClose: () => void;
  onSubmit: (payload: SubmitPayload) => Promise<void>;
  saving: boolean;
}) {
  const isEdit = Boolean(initial?.id);
  const [name, setName] = useState(initial?.name || initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [startDate, setStartDate] = useState(initial?.startDate ? String(initial.startDate).slice(0, 10) : "");
  const [endDate, setEndDate] = useState(initial?.endDate ? String(initial.endDate).slice(0, 10) : "");
  const [prizePool, setPrizePool] = useState(initial?.prizePool != null ? String(initial.prizePool) : "");
  const [maxParticipants, setMaxParticipants] = useState(initial?.maxParticipants != null ? String(initial.maxParticipants) : "");
  const [teamFormat, setTeamFormat] = useState(initial?.teamFormat || "");
  const [maxMembersPerTeam, setMaxMembersPerTeam] = useState(initial?.maxMembersPerTeam != null ? String(initial.maxMembersPerTeam) : "");
  const [hashtags, setHashtags] = useState(
    initial?.hashtags
      ? initial.hashtags
          .split("#")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .join(", ")
      : "",
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);

  async function uploadLogo(file: File): Promise<number | null> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/attachment/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return Number(data?.data?.id ?? data?.id ?? 0) || null;
  }

  async function handleSubmit() {
    const cleanName = name.trim();
    const cleanTeamFormat = teamFormat.trim();
    const cleanPrizePool = prizePool.trim();

    if (!cleanName) return window.alert("Turnir nomini kiriting.");
    if (!startDate) return window.alert("Boshlanish sanasini tanlang.");
    if (!endDate) return window.alert("Tugash sanasini tanlang.");
    if (!cleanPrizePool) return window.alert("Mukofot jamg'armasini kiriting.");
    if (!cleanTeamFormat) return window.alert("Jamoa formatini kiriting.");
    if (!isEdit && !logoFile) return window.alert("Logo tanlang.");

    let logoAttachmentId: number | null = null;
    if (logoFile) {
      logoAttachmentId = await uploadLogo(logoFile);
      if (!logoAttachmentId) return window.alert("Logo yuklab bo'lmadi.");
    }

    const tags = hashtags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(",");

    const data: Record<string, unknown> = {
      name: cleanName,
      description: description.trim() || undefined,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      prizePool: cleanPrizePool,
      maxParticipants: maxParticipants.trim() ? Number(maxParticipants.trim()) : undefined,
      teamFormat: cleanTeamFormat,
      maxMembersPerTeam: maxMembersPerTeam.trim() ? Number(maxMembersPerTeam.trim()) : undefined,
      hashtags: tags || undefined,
      ...(logoAttachmentId ? { logoAttachmentId } : {}),
    };

    if (isEdit && initial?.id != null) {
      await onSubmit({ mode: "update", id: initial.id, data });
      return;
    }
    await onSubmit({ mode: "create", data });
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(2,6,12,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          maxHeight: "94dvh",
          overflowY: "auto",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.16)",
          background: "linear-gradient(180deg, rgba(17,25,39,0.96), rgba(11,16,28,0.96))",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 46px rgba(0,0,0,0.42)",
          padding: 12,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {isEdit ? "Turnirni tahrirlash" : "Turnir yaratish"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Logo</span>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
          </label>
          <Field label="Turnir nomi" value={name} onChange={setName} placeholder="Turnir nomi" />
          <Field label="Tavsif" value={description} onChange={setDescription} placeholder="Tavsif (ixtiyoriy)" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Boshlanish sanasi" value={startDate} onChange={setStartDate} type="date" icon={<Calendar size={14} />} />
            <Field label="Tugash sanasi" value={endDate} onChange={setEndDate} type="date" icon={<Calendar size={14} />} />
          </div>

          <Field label="Mukofot jamg'armasi" value={prizePool} onChange={setPrizePool} placeholder="5000000" />
          <Field label="Maksimal jamoalar soni" value={maxParticipants} onChange={setMaxParticipants} placeholder="16" type="number" />
          <Field label="Jamoa formati" value={teamFormat} onChange={setTeamFormat} placeholder="5 vs 5" />
          <Field label="Jamoada maksimal a'zolar" value={maxMembersPerTeam} onChange={setMaxMembersPerTeam} placeholder="5" type="number" />
          <Field label="Hashtaglar" value={hashtags} onChange={setHashtags} placeholder="esports, pubg, quvna" />

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving}
            style={{
              marginTop: 4,
              minHeight: 40,
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(180deg, #29e79a, #10b981)",
              color: "#022515",
              fontSize: 14,
              fontWeight: 800,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saqlanmoqda..." : isEdit ? "Saqlash" : "Yaratish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "date" | "number";
  icon?: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6, minWidth: 0 }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{label}</span>
      <div
        style={{
          minHeight: 40,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 10px",
        }}
      >
        {icon}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "#fff",
            fontSize: 13,
          }}
        />
      </div>
    </label>
  );
}
