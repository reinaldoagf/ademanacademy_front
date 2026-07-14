import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // Si estás usando versiones recientes de Next.js, esto puede estar bajo experimental o directo en la raíz
    serverActions: {
      bodySizeLimit: '10mb', // 🚀 Incrementa el límite a 10 Megabytes
    },
  },
};

export default nextConfig;
