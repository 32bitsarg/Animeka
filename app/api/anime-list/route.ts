import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener lista de anime del usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    const animeList = await prisma.animeListEntry.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({ data: animeList })
  } catch (error) {
    console.error('Error fetching anime list:', error)
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

    const body = await request.json()
    const { animeId, status, score, progress, notes } = body

    if (!animeId || !status) {
      return NextResponse.json(
        { error: 'animeId y status son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existing = await prisma.animeListEntry.findUnique({
      where: {
        userId_animeId: {
          userId: session.user.id,
          animeId: parseInt(animeId),
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
        animeId: parseInt(animeId),
        status,
        score: score ? parseFloat(score) : null,
        progress: progress ? parseInt(progress) : 0,
        notes: notes || null,
        startedAt: status === 'WATCHING' ? new Date() : null,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    })

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error) {
    console.error('Error adding to list:', error)
    return NextResponse.json(
      { error: 'Error al añadir a la lista' },
      { status: 500 }
    )
  }
}


