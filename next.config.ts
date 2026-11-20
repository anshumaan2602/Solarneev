import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export: `npm run build` writes the whole site to `out/`,
  // which any static host can serve. No Node server is needed.
  output: "export",
  // Emit /hi/index.html rather than /hi.html, so every host serves /hi/
  // without rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
