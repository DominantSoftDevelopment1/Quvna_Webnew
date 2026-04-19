"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initWatchdogCloud, getWatchdogCloud } from "@/lib/watchdog-cloud";
import { api } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 5 * 60_000, gcTime: 10 * 60_000, retry: 1 } },
  }));

  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  useEffect(() => {
    const watchdog = initWatchdogCloud({
      serverUrl: process.env.NEXT_PUBLIC_WATCHDOG_URL || "ws://localhost:9999",
      appName: "Quvna Web",
      appVersion: "2.0.0",
      enableConsoleCapture: true,
      enableErrorCapture: true,
      enableNetworkCapture: true,
      enableRouteCapture: true,
    });

    watchdog.interceptAxios(api);
    watchdog.start();
    watchdog.info("Quvna Web watchdog cloud ga ulandi", { title: "System" });

    return () => {
      watchdog.stop();
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const watchdog = getWatchdogCloud();
    if (!watchdog) return;
    const action = prevPathname.current === null ? "push" : "replace";
    watchdog.trackRoute(pathname, action);
    prevPathname.current = pathname;
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
