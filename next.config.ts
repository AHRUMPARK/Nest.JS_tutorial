import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    DATABASE_URL: process.env.POSTGRES_URL,
  },
};

export default nextConfig;
