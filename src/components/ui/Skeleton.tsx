import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg", className)}
      style={{ background: "var(--bg-card2)", ...style }}
    />
  );
}
