import path from "node:path";
import type { NextConfig } from "next";

const appRoot = path.join(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
  outputFileTracingRoot: appRoot,
};

export default nextConfig;
