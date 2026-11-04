import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
