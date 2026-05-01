import { MiniAppWebviewClient } from "./client";

interface PageProps {
  searchParams: Promise<{ theme?: string }>;
}

export default async function MiniAppForMobilePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const theme = params.theme === "light" ? "light" : "dark";
  return <MiniAppWebviewClient theme={theme} />;
}
