import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Capture uploads up to ~3MB (multipart overhead needs headroom)
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
