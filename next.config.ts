import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The marketing page is a static file in public/ (built with the design kit's plain CSS and JS),
  // served at the site root. The app itself starts at /login and /dashboard.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }] };
  },
};

export default nextConfig;
