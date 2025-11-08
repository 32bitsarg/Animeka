/**
 * Sistema de cache simple para optimizar llamadas a API
 * Evita llamadas duplicadas y mejora tiempos de respuesta
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live en milisegundos
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const cache = new SimpleCache()

/**
 * Wrapper para fetch con cache
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  const cached = cache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  const data = await fetcher()
  cache.set(key, data, ttl)
  return data
}

