import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth"],
  allowedDevOrigins: ["*.agent.cvm.dev", "*.cvm.dev"],
};

export default nextConfig;
