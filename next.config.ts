import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://quvna.dominantsoftdevelopment.uz/:path*",
      },
      {
        source: "/hls-proxy/:path*",
        destination: "https://quvna-live.b-cdn.net/:path*",
      },
    ];
  },
};

export default nextConfig;
