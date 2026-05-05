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
        className={`inline-flex shrink-0 items-center justify-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${palette.fg} ${palette.bg}`}
        aria-label={label}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-[11px] font-semibold leading-none ${palette.text} ${palette.border} bg-white/[0.04]`}
    >
      {label}
    </span>
  );
}
