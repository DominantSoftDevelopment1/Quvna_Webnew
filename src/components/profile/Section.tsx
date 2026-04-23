import type { CSSProperties, ReactNode } from "react";

const SECTION_TITLE_TO_CARD_GAP_PX = 12;
const SECTION_CARD_PADDING_PX = 12;

type SectionProps = {
  title: string;
  children: ReactNode;
  cardClassName?: string;
  cardStyle?: CSSProperties;
};

export default function Section({ title, children, cardClassName = "", cardStyle }: SectionProps) {
  return (
    <div>
      <h2
        className="px-1 text-base font-normal uppercase tracking-normal text-[var(--text-secondary)]"
        style={{ marginBottom: SECTION_TITLE_TO_CARD_GAP_PX }}
      >
        {title}
      </h2>
      <div
        className={`space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card2)] ${cardClassName}`.trim()}
        style={{ padding: SECTION_CARD_PADDING_PX, ...cardStyle }}
      >
        {children}
      </div>
    </div>
  );
}
