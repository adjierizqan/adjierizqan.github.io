import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: "export",
  turbopack: { root: process.cwd() },
  trailingSlash: true,
  images: {
    // GitHub Pages has no image optimization server
    unoptimized: true,
  },
};

export default nextConfig;
