"use client";

interface StreamHostBadgeProps {
  variant?: "text" | "icon";
  label?: string;
}

export function StreamHostBadge({ variant = "text", label = "Strim egasi" }: StreamHostBadgeProps) {
  if (variant === "icon") {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center rounded px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-black bg-[#03ff93]"
        aria-label={label}
      >
        {label === "Siz" ? "SIZ" : "HOST"}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-[#03ff93] border border-[#03ff93]/40">
      {label}
    </span>
  );
}
