import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * After each deploy, document HTML must not stay cached with old chunk hashes.
   * Hashed assets under /_next/static keep long-cache.
   */
  async headers() {
    return [
      {
        // HTML / app routes only (exclude static assets)
        source:
          "/((?!_next/static|_next/image|style/|botui/|uploads/|favicon.ico).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
