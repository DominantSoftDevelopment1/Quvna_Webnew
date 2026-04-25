"use client";

interface VideoTermsModalProps {
  isOpen: boolean;
  accepted: boolean;
  onToggleAccepted: (value: boolean) => void;
  onAccept: () => void;
}

export function VideoTermsModal({
  isOpen,
  accepted,
  onToggleAccepted,
  onAccept,
}: VideoTermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 py-6">
      <div className="w-full max-w-[560px] max-h-[calc(100dvh-32px)] rounded-[28px] border border-white/10 bg-[#111113] text-white shadow-[0_24px_80px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col">
        <header className="h-[78px] px-6 flex items-center gap-4 border-b border-white/10 bg-[#17171a] shrink-0">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black text-xl font-black shadow-lg shadow-amber-500/20">
            i
          </div>

          <div>
            <h3 className="text-[23px] font-black leading-tight">
              Foydalanish shartlari
            </h3>
            <p className="text-[14px] text-zinc-400 mt-1">
              Davom etishdan oldin shartlarni o‘qing
            </p>
          </div>
        </header>

        <div className="overflow-y-auto custom-scroll">
          <div
            style={{
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              fontSize: 16,
              lineHeight: "28px",
              color: "#d4d4d8",
              boxSizing: "border-box",
            }}
          >
            <section
              style={{
                width: "100%",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.045)",
                padding: 20,
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "white",
                }}
              >
                1. Общие положения
              </p>
              <p style={{ margin: 0 }}>
                1.1. Настоящие правила регулируют деятельность пользователей,
                осуществляющих трансляции игр (стриминг) на платформе.
              </p>
              <p style={{ margin: "8px 0 0 0" }}>
                1.2. Используя платформу, пользователь подтверждает, что ознакомился
                с настоящими правилами и принимает их условия.
              </p>
            </section>

            <section
              style={{
                width: "100%",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.045)",
                padding: 20,
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "white",
                }}
              >
                2. Общие положения
              </p>
              <p style={{ margin: 0 }}>
                2.1. Настоящие правила регулируют деятельность пользователей,
                осуществляющих трансляции игр (стриминг) на платформе.
              </p>
              <p style={{ margin: "8px 0 0 0" }}>
                2.2. Используя платформу, пользователь подтверждает, что ознакомился
                с настоящими правилами и принимает их условия.
              </p>
            </section>

            <section
              style={{
                width: "100%",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.045)",
                padding: 20,
                boxSizing: "border-box",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 18,
                  fontWeight: 900,
                  color: "white",
                }}
              >
                3. Общие положения
              </p>
              <p style={{ margin: 0 }}>
                3.1. Настоящие правила регулируют деятельность пользователей,
                осуществляющих трансляции игр (стриминг) на платформе. Batafsil
              </p>
            </section>
          </div>
        </div>

        <footer className="px-6 py-5 border-t border-white/10 bg-[#111113] shrink-0 flex flex-col gap-4">
          <label
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.045)",
              padding: 16,
              boxSizing: "border-box",
              fontSize: 16,
              fontWeight: 700,
              color: "#f4f4f5",
            }}
            className="cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => onToggleAccepted(e.target.checked)}
              className="h-5 w-5 rounded accent-emerald-500 shrink-0"
            />
            <span>Barcha shartlarni qabul qilaman</span>
          </label>

          <button
            type="button"
            onClick={onAccept}
            disabled={!accepted}
            className="w-full h-[56px] rounded-2xl bg-emerald-500 text-black text-[18px] font-black transition-all hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
          >
            Qabul qilish
          </button>
        </footer>

        <style jsx>{`
          .custom-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: rgba(113, 113, 122, 0.7);
            border-radius: 999px;
          }
        `}</style>
      </div>
    </div>
  );
}
