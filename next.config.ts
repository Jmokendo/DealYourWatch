import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  turbopack: {
    // Ensure Next doesn't infer the wrong workspace root when multiple lockfiles exist.
    root: __dirname,
  },
};

export default nextConfig;
