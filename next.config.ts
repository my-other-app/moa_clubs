import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["mulearn-backend-test.s3.amazonaws.com"], // Add your image domains here
  },
  trailingSlash: false, // Ensure URLs don't have a trailing slash (important for Vercel)
  async redirects() {
    return [
      {
        source: "/old-route",
        destination: "/new-route",
        permanent: true, // Permanent redirect (301)
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/custom-api",
        destination: "/api/hello", // Rewrite API calls
      },
    ];
  },
};

export default nextConfig;
