import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ensure Next doesn't infer the wrong workspace root when multiple lockfiles exist.
    root: __dirname,
  },
};

export default nextConfig;
