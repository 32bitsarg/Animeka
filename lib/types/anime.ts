// Tipos para la API de Jikan (MyAnimeList)

export interface Anime {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  trailer: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
  }
  approved: boolean
  titles: Array<{
    type: string
    title: string
  }>
  title: string
  title_english: string | null
  title_japanese: string | null
  type: string | null
  source: string | null
  episodes: number | null
  status: string | null
  airing: boolean
  aired: {
    from: string | null
    to: string | null
    string: string
  }
  duration: string | null
  rating: string | null
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number | null
  favorites: number | null
  synopsis: string | null
  background: string | null
  season: string | null
  year: number | null
  broadcast: {
    day: string | null
    time: string | null
    timezone: string | null
    string: string | null
  }
  producers: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  licensors: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  studios: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  themes: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  demographics: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
}

export interface AnimeSearchResponse {
  data: Anime[]
  pagination: {
    last_visible_page: number
    has_next_page: boolean
    current_page: number
    items: {
      count: number
      total: number
      per_page: number
    }
  }
}

export interface AnimeCharacter {
  character: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
      }
      webp: {
        image_url: string
      }
    }
    name: string
  }
  role: string
  voice_actors: Array<{
    person: {
      mal_id: number
      url: string
      images: {
        jpg: {
          image_url: string
        }
      }
      name: string
    }
    language: string
  }>
}

export interface AnimeRecommendation {
  entry: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
      webp: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
    }
    title: string
  }
  url: string
  votes: number
}

// Tipos para filtros
export interface AnimeFilters {
  type?: 'tv' | 'movie' | 'ova' | 'special' | 'ona' | 'music'
  status?: 'airing' | 'complete' | 'upcoming'
  rating?: 'g' | 'pg' | 'pg13' | 'r17' | 'r' | 'rx'
  genre?: string
  order_by?: 'mal_id' | 'title' | 'start_date' | 'end_date' | 'episodes' | 'score' | 'scored_by' | 'rank' | 'popularity' | 'members' | 'favorites'
  sort?: 'desc' | 'asc'
  page?: number
  limit?: number
  q?: string
  score?: number
  min_score?: number
  max_score?: number
}



