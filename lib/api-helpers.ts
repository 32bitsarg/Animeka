/**
 * Helpers para optimizar respuestas de API y reducir costos de Vercel
 */

import { NextResponse } from 'next/server'

/**
 * Agregar headers de cache a respuestas
 */
export function addCacheHeaders(
  response: NextResponse,
  maxAge: number = 300, // 5 minutos por defecto
  staleWhileRevalidate: number = 86400 // 24 horas
): NextResponse {
  response.headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}, max-age=${maxAge}`
  )
  return response
}

/**
 * Crear respuesta JSON con cache
 */
export function jsonWithCache(
  data: any,
  maxAge: number = 300,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addCacheHeaders(response, maxAge)
}

/**
 * Headers de cache predefinidos para diferentes tipos de datos
 */
export const CACHE_HEADERS = {
  // Datos que cambian raramente
  STATIC: { maxAge: 86400, staleWhileRevalidate: 604800 }, // 24h / 7 días
  ANIME_DETAIL: { maxAge: 3600, staleWhileRevalidate: 86400 }, // 1h / 24h
  TOP_ANIME: { maxAge: 1800, staleWhileRevalidate: 3600 }, // 30min / 1h
  
  // Datos que cambian más frecuentemente
  USER_DATA: { maxAge: 60, staleWhileRevalidate: 300 }, // 1min / 5min
  RECOMMENDATIONS: { maxAge: 300, staleWhileRevalidate: 600 }, // 5min / 10min
  SEARCH: { maxAge: 300, staleWhileRevalidate: 600 }, // 5min / 10min
  
  // Sin cache
  NO_CACHE: { maxAge: 0, staleWhileRevalidate: 0 },
}

