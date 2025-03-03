import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["mulearn-backend-test.s3.amazonaws.com"], // Add your image domains here
  },
  trailingSlash: false, // Ensure URLs don't have a trailing slash (important for Vercel)
};

export default nextConfig;
