import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  devIndicators: false,
  // Permite cargar la app vía túnel ngrok en desarrollo (Next 16 bloquea orígenes externos por defecto).
  allowedDevOrigins: [
    "192.168.31.115",
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
  turbopack: {
    // Evita que Turbopack infiera un workspace root incorrecto (varios lockfiles).
    root: monorepoRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/brand-icon",
      },
    ];
  },
};

export default nextConfig;
