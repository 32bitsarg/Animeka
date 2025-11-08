import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, rateLimits } from '@/lib/rate-limit'

// POST - Dar/Quitar like a una recomendación
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Rate limiting para likes
    const identifier = `likes_${session.user.email}`
    const rateLimit = await checkRateLimit(identifier, rateLimits.likes)

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiados likes. Espera un momento.',
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

    // En Next.js 16, params es una Promise
    const { id } = await params
    const recommendationId = id

    // Validar formato de ID
    if (!recommendationId || recommendationId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'ID de recomendación inválido' },
        { status: 400 }
      )
    }

    // Verificar si la recomendación existe
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    })

    if (!recommendation) {
      return NextResponse.json(
        { success: false, error: 'Recomendación no encontrada' },
        { status: 404 }
      )
    }

    // No permitir dar like a tu propia recomendación
    if (recommendation.userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'No puedes dar like a tu propia recomendación' },
        { status: 400 }
      )
    }

    // Verificar si ya dio like
    const existingLike = await prisma.recommendationLike.findUnique({
      where: {
        userId_recommendationId: {
          userId: user.id,
          recommendationId,
        },
      },
    })

    if (existingLike) {
      // Quitar like
      await prisma.recommendationLike.delete({
        where: {
          id: existingLike.id,
        },
      })

      return NextResponse.json({
        success: true,
        action: 'unliked',
        message: 'Like removido',
      })
    } else {
      // Dar like
      await prisma.recommendationLike.create({
        data: {
          userId: user.id,
          recommendationId,
        },
      })

      return NextResponse.json({
        success: true,
        action: 'liked',
        message: 'Like agregado',
      })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { success: false, error: 'Error al procesar like' },
      { status: 500 }
    )
  }
}

