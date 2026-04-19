import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Quvna",
  description: "Gaming video platform",
  icons: {
    icon: "/quvna_logo.png",
    apple: "/quvna_logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className="h-full">
      <body className="h-full flex">
        <Providers>
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <main className="main-scroll">
              {children}
            </main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
