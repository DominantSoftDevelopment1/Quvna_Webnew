"use client";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({ label, value, onChange, placeholder, multiline }: EditableFieldProps) {
  return (
    <div className="grid min-h-[48px] gap-2 border-b border-[var(--border)] py-3 sm:grid-cols-[120px_1fr] sm:items-center">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[88px] resize-none rounded-xl border border-[var(--border)] bg-[var(--bg-card2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] sm:text-right"
        />
      )}
    </div>
  );
}
