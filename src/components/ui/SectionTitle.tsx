import Link from "next/link";

interface Props {
  title: string;
  href?: string;
  onAction?: () => void;
  icon?: string;
}

export function SectionTitle({ title, href, onAction, icon }: Props) {
  return (
    <div className="section-title-wrap home-section-title">
      <div className="section-title-left">
        {icon && (
          <img src={icon} alt="" width={20} height={20} className="section-title-icon" />
        )}
        <h2 className="section-title-text">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="section-title-action">
          <span>Barchasi</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      )}
      {!href && onAction && (
        <button type="button" onClick={onAction} className="section-title-action">
          <span>Barchasi</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
