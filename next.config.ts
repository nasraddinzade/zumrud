import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All product photos are local files in public/products, already 800x800 webp.
    formats: ["image/webp"],
  },
};

export default nextConfig;
