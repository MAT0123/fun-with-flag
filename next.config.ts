import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images:{
    domains: ['www.countryflags.io']
  },
  env: {
    GEMINI_API: process.env.GEMINI_API
  }
};

export default nextConfig;
