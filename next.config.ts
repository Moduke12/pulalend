import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Ensure static files are properly served
  staticPageGenerationTimeout: 60,
};

export default nextConfig;
