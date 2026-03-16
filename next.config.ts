import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { hostname: "api.mapbox.com" },
      { hostname: "events.mapbox.com" },
      // Supabase Storage
      { hostname: "luhpzlrnircdiueimmfk.supabase.co" },
      // Imágenes externas (scrapeadas)
      { hostname: "*.alquilerargentina.com" },
      { hostname: "images.unsplash.com" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
