import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getIdentifier, rateLimits } from '@/lib/rate-limit'
import { jsonWithCache, CACHE_HEADERS } from '@/lib/api-helpers'

// Optimizar para Vercel
export const runtime = 'nodejs'
export const maxDuration = 5

// GET - Obtener los animes más populares basados en recomendaciones y likes
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const rateLimit = await checkRateLimit(identifier, rateLimits.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas peticiones. Por favor, espera un momento.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimits.api.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          }
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '10')
    const limit = Math.min(Math.max(limitParam, 1), 20) // Entre 1 y 20

    // Obtener todas las recomendaciones que no sean "Opinión General"
    const recommendations = await prisma.recommendation.findMany({
      where: {
        animeId: {
          not: 0
        },
        animeTitle: {
          not: 'Opinión General'
        }
      },
      include: {
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    // Agrupar por animeId y calcular métricas
    const animeMap = new Map<number, {
      animeId: number
      animeTitle: string
      animeImage: string | null
      totalRecommendations: number
      totalLikes: number
      averageRating: number
      totalScore: number // Para ordenar: recomendaciones + likes
    }>()

    for (const rec of recommendations) {
      const existing = animeMap.get(rec.animeId)
      const likesCount = rec._count.likes

      if (existing) {
        existing.totalRecommendations += 1
        existing.totalLikes += likesCount
        existing.totalScore += 1 + likesCount // Peso: 1 por recomendación + 1 por cada like
        // Calcular promedio de rating
        const currentTotal = existing.averageRating * (existing.totalRecommendations - 1)
        existing.averageRating = (currentTotal + rec.rating) / existing.totalRecommendations
      } else {
        animeMap.set(rec.animeId, {
          animeId: rec.animeId,
          animeTitle: rec.animeTitle,
          animeImage: rec.animeImage,
          totalRecommendations: 1,
          totalLikes: likesCount,
          averageRating: rec.rating,
          totalScore: 1 + likesCount
        })
      }
    }

    // Convertir a array y ordenar por totalScore (popularidad)
    const popularAnimes = Array.from(animeMap.values())
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((anime, index) => ({
        ...anime,
        rank: index + 1
      }))

    // Usar cache helper para optimizar respuesta
    const response = jsonWithCache(
      {
        success: true,
        data: popularAnimes,
      },
      CACHE_HEADERS.RECOMMENDATIONS.maxAge
    )
    
    // Agregar headers de rate limit
    response.headers.set('X-RateLimit-Limit', rateLimits.api.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    
    return response
  } catch (error) {
    console.error('Error fetching popular animes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener animes populares' },
      { status: 500 }
    )
  }
}

