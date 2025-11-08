import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    formats: ['image/avif', 'image/webp'], // Formatos modernos
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 días
  },

  // Compilación optimizada
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Mantener errores y warnings en producción
    } : false,
  },

  // Headers de seguridad ya están en middleware.ts
  
  // Modo experimental - mejoras de performance
  experimental: {
    // Optimizaciones de servidor
    serverMinification: true,
    serverSourceMaps: false, // Deshabilitar en producción para menor bundle
  },

  // Configuración de webpack
  webpack: (config, { isServer }) => {
    // Tree shaking mejorado
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
    }

    return config
  },

  // Compresión
  compress: true,

  // Generar ETags para caching
  generateEtags: true,

  // Modo de producción
  poweredByHeader: false, // Ocultar header X-Powered-By
  reactStrictMode: true,
};

export default nextConfig;
