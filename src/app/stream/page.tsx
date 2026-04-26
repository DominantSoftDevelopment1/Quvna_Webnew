"use client";

import React, { useMemo, useRef, useState } from "react";

const serverUrl = "rtmp://live.quvna.com/live";
const initialKey = "qvn_live_7K9F-22MP-X8QD-PRIVATE";

type CopyStatus = "idle" | "copied" | "manual" | "failed";

interface FieldBoxProps {
  label: string;
  value: string;
  secret?: boolean;
}

interface StepProps {
  number: string;
  title: string;
  text: string;
}

interface StatCardProps {
  label: string;
  value: string;
}

interface CardProps {
  children: React.ReactNode;
  green?: boolean;
}

function getDisplayValue(value: string, secret: boolean, show: boolean): string {
  return secret && !show ? "••••••••••••••••••••••••••••••" : value;
}

async function safeCopyText(value: string, inputElement: HTMLInputElement | null): Promise<CopyStatus> {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function" &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(value);
      return "copied";
    }
  } catch {}

  if (inputElement) {
    inputElement.focus();
    inputElement.select();
    inputElement.setSelectionRange?.(0, inputElement.value.length);
    return "manual";
  }

  return "failed";
}

function FieldBox({ label, value, secret = false }: FieldBoxProps) {
  const [show, setShow] = useState(!secret);
  const [status, setStatus] = useState<CopyStatus>("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const displayValue = getDisplayValue(value, secret, show);

  const handleCopy = async () => {
    const result = await safeCopyText(value, inputRef.current);
    setStatus(result);
    window.setTimeout(() => setStatus("idle"), 1400);
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box", borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.22)", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>{label}</p>
        {secret && (
          <button type="button" onClick={() => setShow(!show)} style={{ border: 0, background: "transparent", color: "#34f5a5", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
            {show ? "Yashirish" : "Ko&apos;rsatish"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 92px", gap: 12, width: "100%", boxSizing: "border-box" }}>
        <input ref={inputRef} readOnly value={displayValue} style={{ width: "100%", minWidth: 0, height: 48, boxSizing: "border-box", borderRadius: 16, border: "1px solid rgba(255,255,255,.1)", background: "#0f1011", padding: "0 14px", color: "white", outline: "none" }} />
        <button type="button" onClick={handleCopy} style={{ height: 48, borderRadius: 16, border: 0, background: "#00d997", color: "#00150d", fontWeight: 900, cursor: "pointer" }}>
          {status === "copied" ? "Copied" : status === "manual" ? "Select" : "Copy"}
        </button>
      </div>

      {status === "manual" && <p style={{ margin: "10px 0 0", color: "#fde68a", fontSize: 12 }}>Clipboard bloklangan. Ctrl+C yoki Cmd+C bosing.</p>}
    </div>
  );
}

function Step({ number, title, text }: StepProps) {
  return (
    <div style={{ width: "100%", boxSizing: "border-box", display: "flex", gap: 16, borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.045)", padding: 18 }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#00d997", color: "#00150d", fontWeight: 900 }}>{number}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: "white" }}>{title}</p>
        <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.58)", fontSize: 14, lineHeight: "22px" }}>{text}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div style={{ boxSizing: "border-box", borderRadius: 22, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.045)", padding: 22 }}>
      <p style={{ margin: 0, color: "rgba(255,255,255,.45)", fontSize: 14 }}>{label}</p>
      <p style={{ margin: "8px 0 0", color: "white", fontSize: 26, fontWeight: 900 }}>{value}</p>
    </div>
  );
}

function Card({ children, green = false }: CardProps) {
  return (
    <section style={{ width: "100%", boxSizing: "border-box", borderRadius: 28, border: green ? "1px solid rgba(0,217,151,.35)" : "1px solid rgba(255,255,255,.1)", background: green ? "rgba(0,217,151,.08)" : "rgba(255,255,255,.045)", padding: 24 }}>
      {children}
    </section>
  );
}

export default function StreamStudioPage() {
  const [title, setTitle] = useState("PUBG Mobile turnir — jonli efir");
  const [game, setGame] = useState("PUBG MOBILE");
  const [status, setStatus] = useState("offline");
  const [streamKey, setStreamKey] = useState(initialKey);

  const isWaiting = status === "waiting";
  const isLive = status === "live";
  const previewTitle = useMemo(() => title.trim() || "Stream nomi kiritilmagan", [title]);

  const regenerateKey = () => {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    setStreamKey(`qvn_live_${random}-NEW-PRIVATE`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0d0e", color: "white", boxSizing: "border-box" }}>
      <div style={{ width: "100%", boxSizing: "border-box", padding: "28px 32px 90px", overflowX: "hidden" }}>
        <header style={{ width: "100%", boxSizing: "border-box", borderRadius: 28, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.045)", padding: 24, marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.15, fontWeight: 900 }}>Stream Studio</h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.58)", fontSize: 15 }}>OBS uchun Stream URL va Stream Key oling</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" onClick={() => setStatus("waiting")} style={{ height: 52, borderRadius: 18, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.06)", color: "white", padding: "0 22px", fontWeight: 900, cursor: "pointer" }}>Stream yaratish</button>
              <button type="button" onClick={() => setStatus(isLive ? "offline" : "live")} style={{ height: 52, borderRadius: 18, border: 0, background: isLive ? "#ef4444" : "#00d997", color: isLive ? "white" : "#00150d", padding: "0 22px", fontWeight: 900, cursor: "pointer" }}>{isLive ? "Streamni to&apos;xtatish" : "Jonli boshlash"}</button>
            </div>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 28, width: "100%", boxSizing: "border-box" }}>
          <main style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 28 }}>
            <section style={{ overflow: "hidden", borderRadius: 30, border: "1px solid rgba(255,255,255,.1)", background: "#111315" }}>
              <div style={{ position: "relative", minHeight: 560, background: "radial-gradient(circle at 50% 35%, rgba(255,255,255,.16), transparent 28%), linear-gradient(135deg, rgba(16,185,129,.28), #18231d 45%, #000 100%)" }}>
                <div style={{ position: "absolute", top: 28, left: 28, display: "flex", gap: 12, flexWrap: "wrap", zIndex: 2 }}>
                  <span style={{ borderRadius: 999, padding: "8px 14px", background: isLive ? "#ef4444" : isWaiting ? "#facc15" : "rgba(255,255,255,.1)", color: isWaiting ? "#111" : "white", fontSize: 12, fontWeight: 900 }}>{isLive ? "● JONLI" : isWaiting ? "OBS SIGNAL KUTILYAPTI" : "OFFLINE"}</span>
                  <span style={{ borderRadius: 999, padding: "8px 14px", background: "rgba(0,0,0,.45)", color: "rgba(255,255,255,.82)", fontSize: 12, fontWeight: 800 }}>1080p / 60fps</span>
                </div>

                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 34, textAlign: "center" }}>
                  <div style={{ maxWidth: 900 }}>
                    <div style={{ margin: "0 auto 26px", width: 104, height: 104, borderRadius: "50%", border: "1px solid rgba(255,255,255,.16)", background: "rgba(0,0,0,.35)", display: "grid", placeItems: "center", fontSize: 46 }}>{isLive ? "▶" : isWaiting ? "⏳" : "📺"}</div>
                    <h2 style={{ margin: 0, fontSize: 50, lineHeight: 1.12, fontWeight: 950 }}>{previewTitle}</h2>
                    <p style={{ margin: "14px 0 0", color: "#34f5a5", fontWeight: 900, fontSize: 15 }}>{game}</p>
                    <p style={{ margin: "16px auto 0", color: "rgba(255,255,255,.58)", lineHeight: "28px", fontSize: 15, maxWidth: 650 }}>OBS ichida Server va Stream Key ni qo&apos;ying. OBS dan signal kelgach streamni jonli efirga chiqarishingiz mumkin.</p>
                  </div>
                </div>

                <div style={{ position: "absolute", left: 28, right: 28, bottom: 28, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 18 }}>
                  <div style={{ borderRadius: 18, background: "rgba(0,0,0,.36)", padding: 18 }}><p style={{ margin: 0, color: "rgba(255,255,255,.45)", fontSize: 13 }}>Tomoshabin</p><p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900 }}>0</p></div>
                  <div style={{ borderRadius: 18, background: "rgba(0,0,0,.36)", padding: 18 }}><p style={{ margin: 0, color: "rgba(255,255,255,.45)", fontSize: 13 }}>Bitrate</p><p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900 }}>— kbps</p></div>
                  <div style={{ borderRadius: 18, background: "rgba(0,0,0,.36)", padding: 18 }}><p style={{ margin: 0, color: "rgba(255,255,255,.45)", fontSize: 13 }}>Signal</p><p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 900 }}>{isWaiting || isLive ? "Kutilmoqda" : "Yo&apos;q"}</p></div>
                </div>
              </div>
            </section>

            <Card>
              <h3 style={{ margin: "0 0 22px", fontSize: 22, fontWeight: 900 }}>Stream ma&apos;lumotlari</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 22 }}>
                <label style={{ display: "block", minWidth: 0 }}>
                  <span style={{ display: "block", marginBottom: 10, fontSize: 14, color: "rgba(255,255,255,.65)", fontWeight: 800 }}>Stream nomi</span>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", height: 54, boxSizing: "border-box", borderRadius: 18, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.25)", color: "white", padding: "0 16px", outline: "none" }} />
                </label>
                <label style={{ display: "block", minWidth: 0 }}>
                  <span style={{ display: "block", marginBottom: 10, fontSize: 14, color: "rgba(255,255,255,.65)", fontWeight: 800 }}>O&apos;yin / kategoriya</span>
                  <select value={game} onChange={(e) => setGame(e.target.value)} style={{ width: "100%", height: 54, boxSizing: "border-box", borderRadius: 18, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.25)", color: "white", padding: "0 16px", outline: "none" }}>
                    <option>PUBG MOBILE</option><option>FREE FIRE</option><option>MOBILE LEGENDS</option><option>STEAM</option><option>BOSHQA</option>
                  </select>
                </label>
              </div>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 22 }}>
              <StatCard label="Status" value={isLive ? "Jonli" : isWaiting ? "Signal kutilyapti" : "Offline"} />
              <StatCard label="Resolution" value="1080p" />
              <StatCard label="Latency" value="Low" />
            </div>
          </main>

          <aside style={{ minWidth: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 28 }}>
            <Card green>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 18, marginBottom: 22 }}>
                <div style={{ minWidth: 0 }}><h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>OBS sozlamalari</h3><p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.58)", lineHeight: "22px" }}>Bularni OBS → Settings → Stream ichiga qo&apos;ying</p></div>
                <div style={{ width: 50, height: 50, flexShrink: 0, borderRadius: 18, background: "#00d997", display: "grid", placeItems: "center", fontSize: 24 }}>🔑</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <FieldBox label="Stream URL / Server" value={serverUrl} />
                <FieldBox label="Stream Key" value={streamKey} secret />
              </div>
              <button type="button" onClick={regenerateKey} style={{ width: "100%", height: 52, marginTop: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,.25)", color: "white", fontWeight: 900, cursor: "pointer" }}>Stream keyni yangilash</button>
              <p style={{ margin: "18px 0 0", borderRadius: 18, background: "rgba(239,68,68,.12)", color: "#fecaca", padding: 16, fontSize: 13, lineHeight: "22px" }}>Stream key maxfiy. Uni hech kimga yubormang. Agar key tarqalgan bo&apos;lsa, darhol yangilang.</p>
            </Card>

            <Card>
              <h3 style={{ margin: "0 0 22px", fontSize: 22, fontWeight: 900 }}>OBS ulash tartibi</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Step number="1" title="OBS ni oching" text="Settings → Stream bo&apos;limiga kiring." />
                <Step number="2" title="Service ni Custom qiling" text="Server joyiga Stream URL ni qo&apos;ying." />
                <Step number="3" title="Stream Key ni qo&apos;ying" text="Key joyiga shu yerdagi maxfiy kalitni qo&apos;ying." />
                <Step number="4" title="Start Streaming" text="OBS dan Start Streaming bosing, keyin bu sahifada signal ko&apos;rinadi." />
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
