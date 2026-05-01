import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { WebviewLayoutGuard } from "@/components/layout/WebviewLayoutGuard";

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
    <html lang="uz" className="h-full" suppressHydrationWarning>
      <body className="h-full flex" suppressHydrationWarning>
        <Providers>
          <WebviewLayoutGuard>{children}</WebviewLayoutGuard>
        </Providers>
      </body>
    </html>
  );
}
