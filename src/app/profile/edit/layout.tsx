"use client";

import { useEffect, type ReactNode } from "react";

const BODY_CLASS = "profile-edit-focus";

/**
 * Tahrirlash oqimi (country tanlash, maydonlar) — country-preview.html kabi
 * to'liq ekran: Sidebar + main margin olib tashlanadi (globals.css).
 */
export default function ProfileEditLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add(BODY_CLASS);
    return () => {
      document.body.classList.remove(BODY_CLASS);
    };
  }, []);

  return <>{children}</>;
}
