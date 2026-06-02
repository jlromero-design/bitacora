import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fijar la raíz para Turbopack: hay otros lockfiles en carpetas superiores.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
