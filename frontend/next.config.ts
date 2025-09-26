import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy API to backend to avoid CORS in dev
    const backend = process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:8089";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
