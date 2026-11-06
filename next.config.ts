import type { NextConfig } from "next";
import { journalPermalinks } from "./src/lib/journal/permalinks";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return Array.from(journalPermalinks, ([from, to]) => ({
      source: `/blog/${from}`,
      destination: `/blog/${to}`,
      permanent: true,
    }));
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  outputFileTracingIncludes: {
    "/*": ["./node_modules/@img/sharp-libvips-*/lib/*"],
  },
  outputFileTracingExcludes: {
    "/*": ["./.resource-data/**/*", "./.env*", "./tmp/**/*", "./.git/**/*"],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react", "framer-motion"],
  },
};

export default nextConfig;
