import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Actualizar entrada
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { status, score, progress, notes, isFavorite } = body

    const entry = await prisma.animeListEntry.findUnique({
      where: { id },
    })

    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const updateData: {
      status?: string
      score?: number | null
      progress?: number
      notes?: string | null
      isFavorite?: boolean
      startedAt?: Date
      completedAt?: Date
    } = {}

    if (status !== undefined) updateData.status = status
    if (score !== undefined) updateData.score = score ? (typeof score === 'string' ? parseFloat(score) : score) : null
    if (progress !== undefined) updateData.progress = typeof progress === 'string' ? parseInt(progress, 10) : progress
    if (notes !== undefined) updateData.notes = notes
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite

    // Actualizar fechas
    if (status === 'WATCHING' && !entry.startedAt) {
      updateData.startedAt = new Date()
    }
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const updated = await prisma.animeListEntry.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Error al actualizar' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar entrada
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const entry = await prisma.animeListEntry.findUnique({
      where: { id },
    })

    if (!entry || entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await prisma.animeListEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json(
      { error: 'Error al eliminar' },
      { status: 500 }
    )
  }
}



