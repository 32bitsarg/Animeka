// Sistema de caché simple en memoria para reducir llamadas a la API
interface CacheEntry<T> {
  data: T
  timestamp: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos por defecto
  private customTTLs: Map<string, number> = new Map()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    // Verificar si el caché expiró
    const now = Date.now()
    const ttl = this.customTTLs.get(key) || this.DEFAULT_TTL
    if (now - entry.timestamp > ttl) {
      this.cache.delete(key)
      this.customTTLs.delete(key)
      return null
    }
    
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
    
    if (ttl) {
      this.customTTLs.set(key, ttl)
    }
    
    // Auto-limpieza después del TTL
    const cleanupTime = ttl || this.DEFAULT_TTL
    setTimeout(() => {
      this.cache.delete(key)
      this.customTTLs.delete(key)
    }, cleanupTime)
  }

  clear(): void {
    this.cache.clear()
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    const now = Date.now()
    if (now - entry.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

// Exportar una instancia singleton
export const apiCache = new SimpleCache()

