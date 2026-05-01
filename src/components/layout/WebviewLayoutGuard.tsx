"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";

const WEBVIEW_PREFIX = "/miniapp_for_mobile_dominant_soft_development_in_app";

export function WebviewLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith(WEBVIEW_PREFIX)) {
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
