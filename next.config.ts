import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'msz8xzwxzifxtllw.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
