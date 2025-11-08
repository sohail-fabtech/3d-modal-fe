import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Required for serverless deployment
  
  // Configure asset prefix for static assets
  // This tells Next.js where to load static assets from
  // Will be set dynamically based on deployment environment
  assetPrefix: process.env.ASSETS_BASE_URL || undefined,
  
  // Enable experimental features if needed for serverless
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig;
