import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Parcel photos and avatars are already sized by their providers; serve them directly
    // instead of re-fetching them through the server-side optimiser.
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
