import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind 4 runs as a Turbopack loader, so there is no PostCSS config.
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"] },
    },
  },
  // unpdf ships its own pdf.js build; let Node load it as-is.
  serverExternalPackages: ["unpdf"],
};

export default nextConfig;
