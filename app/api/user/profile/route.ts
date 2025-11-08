import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, getIdentifier, rateLimits } from '@/lib/rate-limit'

// GET - Obtener perfil completo del usuario con recomendaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') // Para ver perfil de otros usuarios (futuro)

    // Por ahora solo permitir ver tu propio perfil
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        banner: true,
        createdAt: true,
        _count: {
          select: {
            animeList: true,
            recommendations: true,
            likes: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Obtener recomendaciones del usuario
    const recommendations = await prisma.recommendation.findMany({
      where: {
        userId: user.id,
        animeId: { not: 0 }, // Solo recomendaciones con anime, no opiniones generales
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        recommendations,
      },
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener perfil' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar perfil (nombre, etc.)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Rate limiting
    const identifier = `update-profile_${session.user.email}`
    const rateLimit = await checkRateLimit(identifier, rateLimits.api)

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas actualizaciones. Por favor, espera un momento.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { name } = body

    // Validar nombre
    if (name && (name.length < 2 || name.length > 50)) {
      return NextResponse.json(
        { success: false, error: 'El nombre debe tener entre 2 y 50 caracteres' },
        { status: 400 }
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

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name: name.trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        banner: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updated,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}

