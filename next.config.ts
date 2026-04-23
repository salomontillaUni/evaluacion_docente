import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "reimagined-goggles-jj7px9rq699qcp6px-3000.app.github.dev",
        "localhost:3000"
      ],
    },
  },
};

export default nextConfig;