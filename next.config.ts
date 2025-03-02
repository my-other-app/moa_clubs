import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["mulearn-backend-test.s3.amazonaws.com"],
  },
  reactStrictMode: true,
};

export default nextConfig;
