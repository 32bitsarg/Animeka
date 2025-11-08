// Sistema de rate limiting en memoria
interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Limpiar entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  async check(identifier: string, limit: number, windowMs: number): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now > entry.resetTime) {
      // Nueva ventana de tiempo
      const resetTime = now + windowMs
      this.requests.set(identifier, { count: 1, resetTime })
      return {
        success: true,
        remaining: limit - 1,
        reset: resetTime,
      }
    }

    if (entry.count >= limit) {
      // Límite alcanzado
      return {
        success: false,
        remaining: 0,
        reset: entry.resetTime,
      }
    }

    // Incrementar contador
    entry.count++
    this.requests.set(identifier, entry)

    return {
      success: true,
      remaining: limit - entry.count,
      reset: entry.resetTime,
    }
  }
}

// Instancia global
const rateLimiter = new RateLimiter()

// Configuraciones predefinidas - Optimizadas para plan gratuito de Vercel
export const rateLimits = {
  signup: { limit: 3, window: 15 * 60 * 1000 }, // 3 intentos / 15 min (más restrictivo)
  signin: { limit: 5, window: 15 * 60 * 1000 }, // 5 intentos / 15 min (más restrictivo)
  api: { limit: 20, window: 60 * 1000 }, // 20 req / min (reducido para ahorrar recursos)
  recommendations: { limit: 5, window: 60 * 1000 }, // 5 recomendaciones / min
  likes: { limit: 30, window: 60 * 1000 }, // 30 likes / min (reducido)
  upload: { limit: 5, window: 60 * 1000 }, // 5 uploads / min
}

export async function checkRateLimit(
  identifier: string,
  config: { limit: number; window: number }
) {
  return rateLimiter.check(identifier, config.limit, config.window)
}

// Helper para obtener identificador del request
export function getIdentifier(request: Request): string {
  // Intentar obtener IP real
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback a user-agent + timestamp hash (menos preciso pero funciona)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return userAgent.substring(0, 50)
}

