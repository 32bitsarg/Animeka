// Sistema de caché optimizado para reducir llamadas a la API y costos de Vercel
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class OptimizedCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly MAX_SIZE = 500 // Límite de entradas para evitar memory leaks
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Limpiar cache expirado cada 10 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 10 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()
    let deleted = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        deleted++
      }
    }
    
    // Si el cache está muy lleno, eliminar las entradas más antiguas
    if (this.cache.size > this.MAX_SIZE) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toDelete = this.cache.size - this.MAX_SIZE
      for (let i = 0; i < toDelete; i++) {
        this.cache.delete(entries[i][0])
      }
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Verificar si el caché expiró
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Si el cache está lleno, limpiar primero
    if (this.cache.size >= this.MAX_SIZE) {
      this.cleanup()
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
    }
  }
}

// Exportar una instancia singleton
export const apiCache = new OptimizedCache()

// TTL predefinidos para diferentes tipos de datos
export const CACHE_TTL = {
  // Datos que cambian raramente - cache largo
  ANIME_DETAIL: 24 * 60 * 60 * 1000, // 24 horas
  TOP_ANIME: 6 * 60 * 60 * 1000, // 6 horas
  TOP_RATED: 6 * 60 * 60 * 1000, // 6 horas
  CURRENT_SEASON: 60 * 60 * 1000, // 1 hora
  CHARACTERS: 12 * 60 * 60 * 1000, // 12 horas
  RECOMMENDATIONS: 12 * 60 * 60 * 1000, // 12 horas
  
  // Datos que cambian más frecuentemente
  SEARCH: 10 * 60 * 1000, // 10 minutos
  RANDOM: 5 * 60 * 1000, // 5 minutos
  GENRES: 30 * 60 * 1000, // 30 minutos
}

