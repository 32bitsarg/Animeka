import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { checkRateLimit, getIdentifier, rateLimits } from '@/lib/rate-limit'
import { signupSchema, validateAndParse } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const rateLimit = await checkRateLimit(identifier, rateLimits.signup)

    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'Demasiados intentos. Por favor, intenta de nuevo más tarde.',
          retryAfter: Math.ceil((rateLimit.reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimits.signup.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          }
        }
      )
    }

    const body = await request.json()

    // Validación con Zod
    const validation = validateAndParse(signupSchema, body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Hashear password con bcrypt (rounds 12 para mayor seguridad)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      { user },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Limit': rateLimits.signup.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    )
  } catch (error) {
    console.error('Error en signup:', error)
    return NextResponse.json(
      { error: 'Error al crear la cuenta' },
      { status: 500 }
    )
  }
}


