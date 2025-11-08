import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, rateLimits } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// GET - Obtener lista de anime del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Rate limiting
    const identifier = `anime-list-get_${session.user.id}`
    const rateLimit = await checkRateLimit(identifier, rateLimits.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Demasiadas peticiones. Por favor, espera un momento.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id,
    }

    // Validar status si se proporciona
    if (status) {
      const validStatuses = ['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Estado inválido' },
          { status: 400 }
        )
      }
      where.status = status
    }

    // Query con paginación
    const [animeList, total] = await Promise.all([
      prisma.animeListEntry.findMany({
        where,
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.animeListEntry.count({ where }),
    ])

    return NextResponse.json({ 
      data: animeList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    logger.error('Error fetching anime list', error)
    return NextResponse.json(
      { error: 'Error al obtener la lista' },
      { status: 500 }
    )
  }
}

// POST - Añadir anime a la lista
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Rate limiting
    const identifier = `anime-list-post_${session.user.id}`
    const rateLimit = await checkRateLimit(identifier, { limit: 20, window: 60 * 1000 })

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Demasiadas peticiones. Por favor, espera un momento.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    const body = await request.json()

    // Validación con Zod
    const { animeListEntrySchema, validateAndParse, sanitizeText } = await import('@/lib/validations')
    const validation = validateAndParse(animeListEntrySchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { animeId, status, score, progress, notes, isFavorite } = validation.data

    // Verificar si ya existe
    const existing = await prisma.animeListEntry.findUnique({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Este anime ya está en tu lista' },
        { status: 400 }
      )
    }

    const entry = await prisma.animeListEntry.create({
      data: {
        userId: session.user.id,
        animeId,
        status,
        score,
        progress,
        notes: notes ? sanitizeText(notes) : null,
        isFavorite,
        startedAt: status === 'WATCHING' ? new Date() : null,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    })

    logger.info(`Anime añadido a lista: ${animeId} por usuario ${session.user.id}`)
    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    logger.error('Error adding to list', error)
    return NextResponse.json(
      { error: 'Error al añadir a la lista' },
      { status: 500 }
    )
  }
}


