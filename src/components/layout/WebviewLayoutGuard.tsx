"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";

const WEBVIEW_PREFIX = "/miniapp_for_mobile_dominant_soft_development_in_app";

// Stream studio to'liq ekran rejimida ishlaydi (sidebar, topbar, bottomnav yo'q)
const FULLSCREEN_PATHS = ["/stream"];

export function WebviewLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Webview - hech qanday layout yo'q
  if (pathname.startsWith(WEBVIEW_PREFIX)) {
    return <>{children}</>;
  }

  // Stream studio - to'liq ekran, sidebar/topbar/bottomnav yo'q
  if (FULLSCREEN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="main-body-scroll">{children}</div>
      </div>
      <BottomNav />
    </>
  );
}
