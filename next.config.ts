import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Store data changes at runtime, so pages and APIs stay dynamic. */
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
