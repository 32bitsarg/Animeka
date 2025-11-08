import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, getIdentifier, rateLimits } from '@/lib/rate-limit'

// Configurar runtime para optimizar en Vercel
export const runtime = 'nodejs'
export const maxDuration = 10 // Máximo 10 segundos para evitar timeouts costosos

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

    // Rate limiting - más restrictivo para ahorrar recursos
    const identifier = `upload-image_${session.user.email}`
    const rateLimit = await checkRateLimit(identifier, rateLimits.upload)

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

    console.log('📥 Recibiendo upload:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      type,
    })

    if (!file) {
      console.error('❌ No se proporcionó ningún archivo')
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!type || (type !== 'avatar' && type !== 'banner')) {
      console.error('❌ Tipo inválido:', type)
      return NextResponse.json(
        { success: false, error: 'Tipo inválido. Debe ser "avatar" o "banner"' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      console.error('❌ Tipo de archivo no permitido:', file.type)
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // No rechazamos por tamaño, simplemente comprimiremos más agresivamente

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
    // Comprimimos automáticamente sin importar el tamaño original
    let optimizedBuffer: Buffer = buffer
    let optimizedType = file.type

    // Intentar usar sharp si está disponible para comprimir agresivamente
    try {
      const sharp = await import('sharp')
      
      // Dimensiones más pequeñas para mantener base64 manejable
      const maxWidth = type === 'avatar' ? 200 : 1200
      const maxHeight = type === 'avatar' ? 200 : 400
      
      // Calidad ajustable según el tamaño original
      let quality = type === 'avatar' ? 75 : 70
      if (buffer.length > 2000000) { // Si es mayor a 2MB, comprimir más
        quality = type === 'avatar' ? 60 : 55
      } else if (buffer.length > 1000000) { // Si es mayor a 1MB
        quality = type === 'avatar' ? 65 : 60
      }

      const sharpInstance = sharp.default(buffer as Buffer)
      optimizedBuffer = await sharpInstance
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer() as Buffer
      
      optimizedType = 'image/jpeg'
      console.log(`✅ Imagen optimizada: ${file.size} bytes -> ${optimizedBuffer.length} bytes (calidad: ${quality}%)`)
      
      // Si después de optimizar sigue siendo muy grande, comprimir más agresivamente
      let attempts = 0
      while (optimizedBuffer.length > 40000 && attempts < 3) { // Intentar mantener bajo 40KB
        quality = Math.max(30, quality - 10) // Reducir calidad en 10%, mínimo 30%
        optimizedBuffer = await sharpInstance
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality, mozjpeg: true })
          .toBuffer() as Buffer
        attempts++
        console.log(`🔄 Re-compresión intento ${attempts}: ${optimizedBuffer.length} bytes (calidad: ${quality}%)`)
      }
    } catch (sharpError) {
      // Si sharp no está disponible, intentar comprimir con canvas o limitar
      console.warn('⚠️ Sharp no disponible, usando imagen original:', sharpError)
      // Si la imagen es muy grande sin sharp, rechazarla
      if (buffer.length > 1000000) { // 1MB sin optimizar
        return NextResponse.json(
          { success: false, error: 'La imagen es demasiado grande. Por favor, intenta con una imagen más pequeña.' },
          { status: 400 }
        )
      }
    }

    // Convertir a base64 para almacenar
    const base64 = optimizedBuffer.toString('base64')
    const dataUrl = `data:${optimizedType};base64,${base64}`
    
    // Verificar que la data URL no sea demasiado larga
    // MySQL TEXT puede almacenar hasta 65KB, pero para evitar problemas usamos 60KB
    // Si aún es muy grande después de todas las optimizaciones, rechazarla
    if (dataUrl.length > 60000) {
      return NextResponse.json(
        { success: false, error: 'La imagen es demasiado grande incluso después de comprimirla. Por favor, intenta con una imagen más pequeña o de menor resolución.' },
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
    console.error('❌ Error uploading image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: `Error al subir la imagen: ${errorMessage}` },
      { status: 500 }
    )
  }
}

