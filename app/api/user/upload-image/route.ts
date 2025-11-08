import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, getIdentifier, rateLimits } from '@/lib/rate-limit'

// Tipos de archivo permitidos
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// POST - Subir imagen (avatar o banner)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Rate limiting
    const identifier = `upload-image_${session.user.email}`
    const rateLimit = await checkRateLimit(identifier, {
      limit: 10,
      window: 60 * 1000, // 1 minuto
    })

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiadas subidas. Por favor, espera un momento.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'avatar' o 'banner'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!type || (type !== 'avatar' && type !== 'banner')) {
      return NextResponse.json(
        { success: false, error: 'Tipo inválido. Debe ser "avatar" o "banner"' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'El archivo es demasiado grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Validar que sea realmente una imagen (magic bytes)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Verificar magic bytes
    const isValidImage = 
      (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) || // JPEG
      (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) || // PNG
      (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) // WebP (RIFF)

    if (!isValidImage) {
      return NextResponse.json(
        { success: false, error: 'El archivo no es una imagen válida' },
        { status: 400 }
      )
    }

    // Optimizar y redimensionar imagen antes de convertir a base64
    // Para evitar problemas con imágenes muy grandes en base64
    let optimizedBuffer = buffer
    let optimizedType = file.type

    // Intentar usar sharp si está disponible, sino usar canvas nativo o simplemente limitar tamaño
    try {
      const sharp = await import('sharp')
      
      const maxWidth = type === 'avatar' ? 200 : 1200  // Reducir más para base64
      const maxHeight = type === 'avatar' ? 200 : 400
      const quality = type === 'avatar' ? 75 : 70  // Calidad más baja para base64

      optimizedBuffer = await sharp.default(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer()
      
      optimizedType = 'image/jpeg'
      console.log(`✅ Imagen optimizada: ${file.size} bytes -> ${optimizedBuffer.length} bytes`)
    } catch (sharpError) {
      // Si sharp no está disponible, usar el buffer original pero validar tamaño
      console.warn('⚠️ Sharp no disponible, usando imagen original')
      if (buffer.length > 500000) { // Si la imagen es mayor a 500KB sin optimizar
        return NextResponse.json(
          { success: false, error: 'La imagen es demasiado grande. Por favor, usa una imagen más pequeña (máximo 500KB).' },
          { status: 400 }
        )
      }
    }

    // Convertir a base64 para almacenar
    const base64 = optimizedBuffer.toString('base64')
    const dataUrl = `data:${optimizedType};base64,${base64}`
    
    // Verificar que la data URL no sea demasiado larga
    // MySQL TEXT puede almacenar hasta 65KB, pero para evitar problemas usamos 50KB
    if (dataUrl.length > 50000) {
      return NextResponse.json(
        { success: false, error: 'La imagen es demasiado grande. Por favor, usa una imagen más pequeña.' },
        { status: 400 }
      )
    }
    
    console.log(`📏 Tamaño de data URL: ${dataUrl.length} caracteres`)

    // Actualizar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const updateData = type === 'avatar' 
      ? { image: dataUrl }
      : { banner: dataUrl }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        image: true,
        banner: true,
      },
    })

    console.log(`✅ Imagen ${type} actualizada para usuario ${user.id}`)
    console.log(`📏 Tamaño de data URL: ${dataUrl.length} caracteres`)

    return NextResponse.json({
      success: true,
      url: dataUrl,
      message: `${type === 'avatar' ? 'Avatar' : 'Banner'} actualizado correctamente`,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { success: false, error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}

