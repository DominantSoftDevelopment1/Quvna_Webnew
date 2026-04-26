"use client";

import { ChevronDown, ChevronLeft, LifeBuoy, MessageCircleWarning, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type FaqItem = {
  id: string;
  q: string;
  a: string;
};

const FAQS: FaqItem[] = [
  {
    id: "video-upload",
    q: "Video yuklanmayapti, nima qilaman?",
    a: "Internet barqarorligini tekshiring, fayl hajmini kamaytiring va ilovani qayta ochib yana urinib ko'ring. Muammo davom etsa, pastdagi forma orqali xabar yuboring.",
  },
  {
    id: "stream-key",
    q: "Stream key ishlamayapti",
    a: "Avval Stream Studio sahifasidan yangi key yarating va OBS ichida eski key o'rniga yangisini qo'ying. Server URL ham to'g'ri kiritilganini tekshiring.",
  },
  {
    id: "account-security",
    q: "Hisobim xavfsizligini qanday oshiraman?",
    a: "Parolni muntazam yangilang, begona qurilmalarda hisobdan chiqing va profilingizdagi shaxsiy ma'lumotlarni minimal darajada ochiq qoldiring.",
  },
];

export default function ProfileSupportPage() {
  const router = useRouter();

  const [openedFaq, setOpenedFaq] = useState<string | null>(FAQS[0].id);
  const [topic, setTopic] = useState("Umumiy savol");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSend = useMemo(() => message.trim().length >= 10, [message]);

  const onSend = () => {
    if (!canSend) return;
    // Hozircha frontend local-confirmation; backend endpoint tayyor bo'lsa shu joyga ulaymiz.
    setSent(true);
    setMessage("");
    window.setTimeout(() => setSent(false), 2500);
  };

  return (
    <div style={{ minHeight: "100dvh", background: "#0b0d0e", color: "#fff", width: "100%" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          margin: "0 auto",
          padding: "12px 16px calc(20px + env(safe-area-inset-bottom))",
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "#0b0d0e",
            paddingTop: 4,
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 32px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Orqaga"
              style={{
                width: 32,
                height: 32,
                border: "none",
                background: "transparent",
                color: "#8b8f96",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                borderRadius: 999,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <h1 style={{ margin: 0, textAlign: "center", fontSize: 16, fontWeight: 600 }}>Qo&apos;llab-quvvatlash</h1>
            <span />
          </div>
        </header>

        <section
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            padding: "14px 12px",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LifeBuoy size={18} color="#34f5a5" />
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Yordam markazi</p>
          </div>
          <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: "20px" }}>
            Tez-tez beriladigan savollarni ko&apos;ring yoki pastdagi forma orqali muammoni yuboring.
          </p>
        </section>

        <section
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            padding: "8px 10px",
            marginBottom: 12,
          }}
        >
          {FAQS.map((item) => {
            const open = openedFaq === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenedFaq((prev) => (prev === item.id ? null : item.id))}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  borderRadius: 10,
                  padding: "10px 8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item.q}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      opacity: 0.75,
                      transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 150ms ease",
                    }}
                  />
                </div>
                {open ? (
                  <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.68)", fontSize: 13, lineHeight: "20px" }}>{item.a}</p>
                ) : null}
              </button>
            );
          })}
        </section>

        <section
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            padding: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <MessageCircleWarning size={17} color="#facc15" />
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Muammo yuborish</p>
          </div>

          <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "rgba(255,255,255,0.66)" }}>
            Mavzu
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.28)",
              color: "#fff",
              padding: "0 10px",
              boxSizing: "border-box",
              marginBottom: 10,
            }}
          >
            <option>Umumiy savol</option>
            <option>Video yuklash muammosi</option>
            <option>Stream muammosi</option>
            <option>Hisob xavfsizligi</option>
            <option>Boshqa</option>
          </select>

          <label style={{ display: "block", marginBottom: 8, fontSize: 12, color: "rgba(255,255,255,0.66)" }}>
            Xabar
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Muammoni batafsil yozing..."
            rows={5}
            style={{
              width: "100%",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.28)",
              color: "#fff",
              padding: "10px",
              boxSizing: "border-box",
              resize: "vertical",
              marginBottom: 10,
            }}
          />

          <button
            type="button"
            disabled={!canSend}
            onClick={onSend}
            style={{
              width: "100%",
              height: 42,
              borderRadius: 10,
              border: "none",
              background: canSend ? "#00f092" : "rgba(255,255,255,0.18)",
              color: canSend ? "#002e1d" : "rgba(255,255,255,0.55)",
              fontWeight: 700,
              cursor: canSend ? "pointer" : "not-allowed",
            }}
          >
            Yuborish
          </button>

          {sent ? (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#86efac" }}>
              Xabar yuborildi. Tez orada javob beramiz.
            </p>
          ) : (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.58)" }}>
              <ShieldCheck size={14} />
              <span style={{ fontSize: 12 }}>Shaxsiy ma&apos;lumotlaringiz himoyalangan.</span>
            </div>
          )}
        </section>

        <section
          style={{
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            padding: "12px",
            marginTop: 12,
          }}
        >
          <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600 }}>Tez bog&apos;lanish</p>
          <a
            href="https://t.me/quvna_support"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: "100%",
              minHeight: 42,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,136,204,0.15)",
              color: "#7dd3fc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              fontWeight: 700,
              boxSizing: "border-box",
              padding: "10px 12px",
            }}
          >
            Telegram orqali bog&apos;lanish
          </a>
        </section>
      </div>
    </div>
  );
}

