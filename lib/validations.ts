import { z } from 'zod'

// Validación de email robusto
const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email demasiado corto')
  .max(255, 'Email demasiado largo')
  .toLowerCase()
  .trim()

// Validación de password con requisitos de seguridad
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')

// Validación de nombre
const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre es demasiado largo')
  .trim()
  .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras')

// Schemas de autenticación
export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const signinSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña requerida'),
})

// Schema para recomendaciones
export const recommendationSchema = z.object({
  animeId: z.number().int().positive('ID de anime inválido'),
  animeTitle: z
    .string()
    .min(1, 'Título requerido')
    .max(500, 'Título demasiado largo')
    .trim(),
  animeImage: z
    .string()
    .url('URL de imagen inválida')
    .max(1000, 'URL demasiado larga')
    .nullable()
    .optional(),
  content: z
    .string()
    .min(50, 'La reseña debe tener al menos 50 caracteres')
    .max(5000, 'La reseña no puede superar los 5000 caracteres')
    .trim(),
  rating: z
    .number()
    .min(0, 'La puntuación mínima es 0')
    .max(10, 'La puntuación máxima es 10'),
  spoilers: z.boolean().default(false),
})

// Schema para anime list entry
export const animeListEntrySchema = z.object({
  animeId: z.number().int().positive(),
  status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH']),
  score: z.number().min(0).max(10).nullable().optional(),
  progress: z.number().int().min(0).default(0),
  notes: z.string().max(2000, 'Notas demasiado largas').nullable().optional(),
  isFavorite: z.boolean().default(false),
})

// Sanitización de texto (prevenir XSS)
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

// Helper para validar y parsear
export function validateAndParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return {
        success: false,
        error: firstError.message,
      }
    }
    return {
      success: false,
      error: 'Error de validación',
    }
  }
}

// Tipos TypeScript generados desde schemas
export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
export type RecommendationInput = z.infer<typeof recommendationSchema>
export type AnimeListEntryInput = z.infer<typeof animeListEntrySchema>

