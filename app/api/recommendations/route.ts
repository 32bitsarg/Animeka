import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../auth/[...nextauth]/route'
import { checkRateLimit, getIdentifier, rateLimits } from '@/lib/rate-limit'

// GET - Obtener todas las recomendaciones con ranking
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
    const sort = searchParams.get('sort') || 'recent'
    const limitParam = parseInt(searchParams.get('limit') || '20')
    const animeIdParam = searchParams.get('animeId')

    // Validar y limitar el parámetro limit
    const limit = Math.min(Math.max(limitParam, 1), 100) // Entre 1 y 100

    // Validar animeId si se proporciona
    let where: any = {}
    if (animeIdParam) {
      const animeId = parseInt(animeIdParam)
      if (isNaN(animeId) || animeId <= 0) {
        return NextResponse.json(
          { success: false, error: 'ID de anime inválido' },
          { status: 400 }
        )
      }
      where.animeId = animeId
    }

    // Configurar ordenamiento
    let orderBy: any = { createdAt: 'desc' }
    
    if (sort === 'popular') {
      orderBy = { likes: { _count: 'desc' } }
    } else if (sort === 'top-rated') {
      orderBy = { rating: 'desc' }
    }

    const recommendations = await prisma.recommendation.findMany({
      where,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // ❌ NO EXPONER EMAIL - Seguridad
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: recommendations,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimits.api.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener recomendaciones' },
      { status: 500 }
    )
  }
}

// POST - Crear una nueva recomendación
export async function POST(request: NextRequest) {
  try {
    // Autenticación
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Rate limiting específico para crear recomendaciones
    const identifier = `recommendations_${session.user.email}`
    const rateLimit = await checkRateLimit(identifier, rateLimits.recommendations)

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Has alcanzado el límite de recomendaciones por minuto.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validación con Zod
    const { recommendationSchema, validateAndParse, sanitizeText } = await import('@/lib/validations')
    const validation = validateAndParse(recommendationSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { animeId, animeTitle, animeImage, content, rating, spoilers } = validation.data

    // Verificar si ya tiene una recomendación para este anime
    const existing = await prisma.recommendation.findFirst({
      where: {
        userId: user.id,
        animeId,
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ya has recomendado este anime' },
        { status: 400 }
      )
    }

    // Sanitizar contenido de texto
    const sanitizedContent = sanitizeText(content)
    const sanitizedTitle = sanitizeText(animeTitle)

    const recommendation = await prisma.recommendation.create({
      data: {
        userId: user.id,
        animeId,
        animeTitle: sanitizedTitle,
        animeImage: animeImage || null,
        content: sanitizedContent,
        rating,
        spoilers: spoilers || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            // ❌ NO EXPONER EMAIL
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: recommendation,
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error creating recommendation:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear recomendación' },
      { status: 500 }
    )
  }
}

