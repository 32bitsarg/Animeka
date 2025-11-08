import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack (opcional, para desarrollo más rápido)
  turbopack: {},

  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días
  },

  // Compilación optimizada
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Modo experimental
  experimental: {
    optimizePackageImports: [
      '@fortawesome/react-fontawesome',
      '@fortawesome/free-solid-svg-icons',
      'framer-motion',
    ],
    serverMinification: true,
    serverSourceMaps: false,
  },

  // Configuración de webpack - Evitar que Prisma intente conectarse durante el build
  webpack: (config, { isServer }) => {
    // Evitar que Prisma intente conectarse durante el build
    if (isServer) {
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      });
    }

    // Tree shaking mejorado
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    }

    return config;
  },

  // Compresión
  compress: true,

  // Generar ETags para caching
  generateEtags: true,

  // Modo de producción
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
