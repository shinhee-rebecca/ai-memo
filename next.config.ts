import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fixes for @xenova/transformers in Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle ONNX runtime files
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };

    return config;
  },
  // Disable static optimization for pages using transformers
  experimental: {
    // Enable webpack build worker
    webpackBuildWorker: true,
  },
};

export default nextConfig;
