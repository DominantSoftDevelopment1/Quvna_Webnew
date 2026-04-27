"use client";

interface CategoryEmptyStateProps {
  title: string;
  description: string;
}

export function CategoryEmptyState({ title, description }: CategoryEmptyStateProps) {
  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center px-6">
      <div className="w-full max-w-[520px] rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-8 text-center">
        <div className="mx-auto mb-6 relative w-[132px] h-[132px]">
          <div className="absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_30%_30%,#9fffd0,transparent_45%),linear-gradient(135deg,#1f2937,#0f172a)] shadow-[0_18px_45px_rgba(0,0,0,0.45)] rotate-[-9deg]" />
          <div className="absolute left-6 top-6 w-[84px] h-[84px] rounded-2xl bg-[linear-gradient(135deg,#22d3ee,#22c55e)] shadow-[0_12px_30px_rgba(34,211,238,0.35)] flex items-center justify-center">
            <span className="text-[#062016] text-[38px] leading-none">◌</span>
          </div>
        </div>

        <h2 className="text-white text-[26px] font-semibold leading-tight">{title}</h2>
        <p className="mt-3 text-white/65 text-[15px] leading-6">{description}</p>
      </div>
    </div>
  );
}

