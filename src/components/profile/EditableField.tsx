"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export function EditableField({ label, value, onChange, placeholder, multiline }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onChange(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </label>
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl text-sm resize-none"
              style={{
                background: "var(--bg-card2)",
                color: "var(--text-primary)",
                border: "1px solid var(--primary)",
                minHeight: "80px"
              }}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "var(--bg-card2)",
                color: "var(--text-primary)",
                border: "1px solid var(--primary)"
              }}
              autoFocus
            />
          )}
          <button
            onClick={handleSave}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--primary)" }}
          >
            <Check size={18} style={{ color: "#000" }} />
          </button>
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "var(--bg-card2)" }}
          >
            <X size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="w-full flex items-center justify-between py-3 border-b last:border-0"
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: value ? "var(--text-primary)" : "var(--text-muted)" }}>
        {value || placeholder || "Kiriting"}
      </span>
    </button>
  );
}
