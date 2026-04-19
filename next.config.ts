import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://quvna.dominantsoftdevelopment.uz/:path*",
      },
    ];
  },
};

export default nextConfig;
