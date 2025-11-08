import axios from 'axios'
import { apiCache } from '../utils/cache'
import type { Anime, AnimeSearchResponse, AnimeCharacter, AnimeRecommendation, AnimeFilters } from '../types/anime'

const JIKAN_API_BASE = process.env.NEXT_PUBLIC_JIKAN_API_URL || 'https://api.jikan.moe/v4'

// Cliente de axios con rate limiting mejorado
const jikanClient = axios.create({
  baseURL: JIKAN_API_BASE,
  timeout: 15000,
})

// Rate limiting mejorado (Jikan tiene límite de 3 req/sec y 60 req/min)
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 500 // ms entre requests (más conservador)
const MAX_RETRIES = 3

async function rateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest))
  }
  lastRequestTime = Date.now()
}

// Función helper para hacer requests con reintentos
async function makeRequest<T>(requestFn: () => Promise<T>, retries = MAX_RETRIES): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await rateLimit()
      return await requestFn()
    } catch (error: any) {
      // Si es error 429 (Too Many Requests), esperar y reintentar
      if (error.response?.status === 429 && attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000 // Backoff exponencial: 1s, 2s, 4s
        console.warn(`Rate limit alcanzado, esperando ${waitTime}ms antes de reintentar...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      // Si es el último intento o no es error 429, lanzar el error
      if (attempt === retries) {
        console.error('Error en request después de reintentos:', error.message)
        return null
      }
    }
  }
  return null
}

/**
 * Obtiene un anime por su ID de MyAnimeList
 */
export async function getAnimeById(id: number): Promise<Anime | null> {
  const cacheKey = `anime_${id}`
  
  // Verificar caché
  const cached = apiCache.get<Anime>(cacheKey)
  if (cached) return cached
  
  const result = await makeRequest(async () => {
    const response = await jikanClient.get<{ data: Anime }>(`/anime/${id}`)
    return response.data.data
  })
  
  // Guardar en caché
  if (result) apiCache.set(cacheKey, result)
  
  return result
}

/**
 * Busca anime por query y filtros
 */
export async function searchAnime(filters: AnimeFilters = {}): Promise<AnimeSearchResponse | null> {
  try {
    await rateLimit()
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })

    const response = await jikanClient.get<AnimeSearchResponse>('/anime', { params })
    return response.data
  } catch (error) {
    console.error('Error searching anime:', error)
    return null
  }
}

/**
 * Obtiene los animes más populares
 */
export async function getTopAnime(page: number = 1, limit: number = 25): Promise<AnimeSearchResponse | null> {
  const cacheKey = `top_anime_${page}_${limit}`
  
  const cached = apiCache.get<AnimeSearchResponse>(cacheKey)
  if (cached) return cached
  
  const result = await searchAnime({
    order_by: 'popularity',
    sort: 'asc',
    page,
    limit,
  })
  
  if (result) apiCache.set(cacheKey, result)
  return result
}

/**
 * Obtiene los animes mejor puntuados
 */
export async function getTopRatedAnime(page: number = 1, limit: number = 25): Promise<AnimeSearchResponse | null> {
  const cacheKey = `top_rated_${page}_${limit}`
  
  const cached = apiCache.get<AnimeSearchResponse>(cacheKey)
  if (cached) return cached
  
  const result = await searchAnime({
    order_by: 'score',
    sort: 'desc',
    page,
    limit,
  })
  
  if (result) apiCache.set(cacheKey, result)
  return result
}

/**
 * Obtiene animes de la temporada actual
 */
export async function getCurrentSeasonAnime(page: number = 1): Promise<AnimeSearchResponse | null> {
  const cacheKey = `current_season_${page}`
  
  const cached = apiCache.get<AnimeSearchResponse>(cacheKey)
  if (cached) return cached
  
  const result = await makeRequest(async () => {
    const response = await jikanClient.get<AnimeSearchResponse>(`/seasons/now`, {
      params: { page }
    })
    return response.data
  })
  
  if (result) apiCache.set(cacheKey, result)
  return result
}

/**
 * Obtiene próximos animes (upcoming)
 */
export async function getUpcomingAnime(page: number = 1): Promise<AnimeSearchResponse | null> {
  try {
    await rateLimit()
    const response = await jikanClient.get<AnimeSearchResponse>(`/seasons/upcoming`, {
      params: { page }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching upcoming anime:', error)
    return null
  }
}

/**
 * Obtiene personajes de un anime
 */
export async function getAnimeCharacters(animeId: number): Promise<AnimeCharacter[]> {
  const result = await makeRequest(async () => {
    const response = await jikanClient.get<{ data: AnimeCharacter[] }>(`/anime/${animeId}/characters`)
    return response.data.data
  })
  return result || []
}

/**
 * Obtiene recomendaciones de un anime
 */
export async function getAnimeRecommendations(animeId: number): Promise<AnimeRecommendation[]> {
  const result = await makeRequest(async () => {
    const response = await jikanClient.get<{ data: AnimeRecommendation[] }>(`/anime/${animeId}/recommendations`)
    return response.data.data
  })
  return result || []
}

/**
 * Obtiene animes aleatorios para discover
 */
export async function getRandomAnime(): Promise<Anime | null> {
  try {
    await rateLimit()
    const response = await jikanClient.get<{ data: Anime }>('/random/anime')
    return response.data.data
  } catch (error) {
    console.error('Error fetching random anime:', error)
    return null
  }
}

/**
 * Genera recomendaciones basadas en géneros
 */
export async function getAnimeByGenres(genreIds: number[], page: number = 1, type: string = 'tv'): Promise<AnimeSearchResponse | null> {
  try {
    await rateLimit()
    const genres = genreIds.join(',')
    const response = await jikanClient.get<AnimeSearchResponse>('/anime', {
      params: {
        genres,
        type, // Filtrar por tipo (tv, movie, ova, etc.)
        order_by: 'score',
        sort: 'desc',
        page
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching anime by genres:', error)
    return null
  }
}


