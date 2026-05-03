"use client";

interface StreamHostBadgeProps {
  variant?: "text" | "icon";
  label?: string;
  tone?: "green" | "yellow";
}

export function StreamHostBadge({
  variant = "text",
  label = "Strim egasi",
  tone = "green",
}: StreamHostBadgeProps) {
  const palette =
    tone === "yellow"
      ? {
          text: "text-[#facc15]",
          border: "border-[#facc15]/45",
          bg: "bg-[#facc15]",
          fg: "text-black",
        }
      : {
          text: "text-[#03ff93]",
          border: "border-[#03ff93]/40",
          bg: "bg-[#03ff93]",
          fg: "text-black",
        };
  if (variant === "icon") {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${palette.fg} ${palette.bg}`}
        aria-label={label}
      >
        {label === "Siz" ? "SIZ" : "HOST"}
      </span>
    );
  }
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${palette.text} border ${palette.border}`}>
      {label}
    </span>
  );
}
