'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AnimeCard from '@/components/AnimeCard'
import { LoadingCard } from '@/components/Loading'
import { getRandomAnime, getAnimeByGenres } from '@/lib/services/jikan'
import type { Anime } from '@/lib/types/anime'

const GENRES = [
  { id: 1, name: 'Acción' },
  { id: 2, name: 'Aventura' },
  { id: 4, name: 'Comedia' },
  { id: 8, name: 'Drama' },
  { id: 10, name: 'Fantasía' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Ciencia Ficción' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Sobrenatural' },
  { id: 41, name: 'Thriller' },
]

// Componentes SVG personalizados para cada mood
const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 2C8 6 6 10 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 10 16 6 12 2Z" fill="url(#fireGradient)" />
    <path d="M12 6C10 8 9 10 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10 14 8 12 6Z" fill="url(#fireGradient2)" opacity="0.8" />
    <defs>
      <linearGradient id="fireGradient" x1="12" y1="2" x2="12" y2="20">
        <stop offset="0%" stopColor="#FF6B35" />
        <stop offset="100%" stopColor="#F7931E" />
      </linearGradient>
      <linearGradient id="fireGradient2" x1="12" y1="6" x2="12" y2="15">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF6B35" />
      </linearGradient>
    </defs>
  </svg>
)

const LaughIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <circle cx="12" cy="12" r="10" fill="url(#laughGradient)" />
    <circle cx="8" cy="9" r="1.5" fill="#1a1a1a" />
    <circle cx="16" cy="9" r="1.5" fill="#1a1a1a" />
    <path d="M8 15C8 15 10 17 12 17C14 17 16 15 16 15" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
    <defs>
      <linearGradient id="laughGradient" x1="12" y1="2" x2="12" y2="22">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
  </svg>
)

const EmotionalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <circle cx="12" cy="12" r="10" fill="url(#emotionalGradient)" />
    <circle cx="8" cy="9" r="1.5" fill="#1a1a1a" />
    <circle cx="16" cy="9" r="1.5" fill="#1a1a1a" />
    <path d="M8 16C8 16 10 18 12 18C14 18 16 16 16 16" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="10" cy="17" r="1" fill="#1a1a1a" />
    <circle cx="14" cy="17" r="1" fill="#1a1a1a" />
    <defs>
      <linearGradient id="emotionalGradient" x1="12" y1="2" x2="12" y2="22">
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#7B68EE" />
      </linearGradient>
    </defs>
  </svg>
)

const FantasyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9L12 2Z" fill="url(#fantasyGradient)" />
    <circle cx="12" cy="12" r="3" fill="url(#fantasyGradient2)" opacity="0.6" />
    <defs>
      <linearGradient id="fantasyGradient" x1="12" y1="2" x2="12" y2="22">
        <stop offset="0%" stopColor="#9B59B6" />
        <stop offset="100%" stopColor="#E91E63" />
      </linearGradient>
      <linearGradient id="fantasyGradient2" x1="12" y1="9" x2="12" y2="15">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
  </svg>
)

const FuturisticIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <rect x="6" y="8" width="12" height="10" rx="2" fill="url(#futuristicGradient)" />
    <circle cx="9" cy="11" r="1.5" fill="#00D4FF" />
    <circle cx="12" cy="13" r="1" fill="#00D4FF" />
    <circle cx="15" cy="11" r="1.5" fill="#00D4FF" />
    <path d="M8 6L12 2L16 6" stroke="url(#futuristicGradient)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M8 18L12 22L16 18" stroke="url(#futuristicGradient)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <defs>
      <linearGradient id="futuristicGradient" x1="12" y1="2" x2="12" y2="22">
        <stop offset="0%" stopColor="#00D4FF" />
        <stop offset="100%" stopColor="#0066FF" />
      </linearGradient>
    </defs>
  </svg>
)

const RomanticIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="url(#romanticGradient)" />
    <defs>
      <linearGradient id="romanticGradient" x1="12" y1="3" x2="12" y2="21.35">
        <stop offset="0%" stopColor="#FF69B4" />
        <stop offset="100%" stopColor="#FF1493" />
      </linearGradient>
    </defs>
  </svg>
)

const MOODS = [
  { icon: FireIcon, label: 'Emocionante', genres: [1, 2], color: 'from-orange-500 to-red-600' },
  { icon: LaughIcon, label: 'Divertido', genres: [4, 36], color: 'from-yellow-400 to-orange-500' },
  { icon: EmotionalIcon, label: 'Emocional', genres: [8, 22], color: 'from-blue-400 to-purple-500' },
  { icon: FantasyIcon, label: 'Fantástico', genres: [10, 37], color: 'from-purple-500 to-pink-500' },
  { icon: FuturisticIcon, label: 'Futurista', genres: [24, 1], color: 'from-cyan-400 to-blue-600' },
  { icon: RomanticIcon, label: 'Romántico', genres: [22, 8], color: 'from-pink-500 to-red-500' },
]

export default function DiscoverPage() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [recommendations, setRecommendations] = useState<Anime[]>([])
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) => {
      const newGenres = prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
      // Limpiar anime aleatorio cuando se seleccionan géneros
      if (newGenres.length > 0) {
        setRandomAnime(null)
      }
      return newGenres
    })
  }

  const selectMood = (genreIds: number[]) => {
    setSelectedGenres(genreIds)
    // Limpiar anime aleatorio cuando se selecciona un mood
    setRandomAnime(null)
  }

  const fetchRecommendations = async () => {
    if (selectedGenres.length === 0) return

    setLoading(true)
    try {
      // Filtrar solo animes tipo TV (no movies ni OVAs)
      const data = await getAnimeByGenres(selectedGenres, 1, 'tv')
      if (data?.data) {
        // Filtro adicional en el cliente por si acaso
        const tvAnimes = data.data.filter(anime => anime.type === 'TV')
        setRecommendations(tvAnimes.slice(0, 24))
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRandomAnime = async () => {
    // Limpiar géneros seleccionados y recomendaciones cuando se busca aleatorio
    setSelectedGenres([])
    setRecommendations([])
    
    setLoading(true)
    try {
      let anime = await getRandomAnime()
      // Filtrar hasta obtener un anime tipo TV (no movies ni OVAs)
      let attempts = 0
      while (anime && anime.type !== 'TV' && attempts < 10) {
        anime = await getRandomAnime()
        attempts++
      }
      if (anime && anime.type === 'TV') {
        setRandomAnime(anime)
      } else if (anime) {
        // Si después de 10 intentos no encontramos TV, usar el último
        setRandomAnime(anime)
      }
    } catch (error) {
      console.error('Error fetching random anime:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedGenres.length > 0) {
      fetchRecommendations()
    } else {
      // Limpiar recomendaciones cuando no hay géneros seleccionados
      setRecommendations([])
    }
  }, [selectedGenres])

  return (
    <div className="min-h-screen py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10 md:mb-12 relative z-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2]">
            Descubre tu próximo anime
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 px-2">
            Selecciona tu mood o géneros favoritos y encuentra algo increíble
          </p>
        </motion.div>

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">¿Cómo te sientes hoy?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.label}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectMood(mood.genres)}
                className="relative p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 hover:from-[#382059]/60 hover:to-[#2a1844]/60 border-2 border-[#5a3d8f]/30 hover:border-[#CF50F2]/50 transition-all text-center backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-[#CF50F2]/20 group overflow-hidden"
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CF50F2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                
                {/* Icono SVG personalizado con gradiente */}
                <div className="mb-2 sm:mb-3 relative z-10 transform group-hover:scale-110 transition-transform duration-300 flex justify-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-br ${mood.color} rounded-full p-2 sm:p-3 md:p-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <mood.icon />
                  </div>
                </div>
                <div className="font-semibold text-foreground relative z-10 text-xs sm:text-sm md:text-base">{mood.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Genre Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-10 md:mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">O selecciona géneros específicos</h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {GENRES.map((genre) => (
              <motion.button
                key={genre.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleGenre(genre.id)}
                className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
                  selectedGenres.includes(genre.id)
                    ? 'gradient-primary text-white shadow-lg'
                    : 'bg-card hover:bg-card-hover border border-border'
                }`}
              >
                {genre.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Random Anime Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 sm:mb-10 md:mb-12 text-center"
        >
          <p className="text-sm sm:text-base text-foreground/70 mb-3 sm:mb-4">¿O prefieres algo totalmente aleatorio?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRandomAnime}
            disabled={loading}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl gradient-accent text-white font-bold text-sm sm:text-base md:text-lg disabled:opacity-50"
          >
            🎲 Sorpréndeme
          </motion.button>
        </motion.div>

        {/* Random Anime Result - Solo mostrar si no hay géneros seleccionados */}
        {randomAnime && selectedGenres.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Tu recomendación aleatoria:</h2>
            <div className="max-w-xs sm:max-w-sm mx-auto">
              <AnimeCard anime={randomAnime} />
            </div>
          </motion.div>
        )}

        {/* Recommendations - Solo mostrar si hay géneros seleccionados y no hay anime aleatorio */}
        {selectedGenres.length > 0 && !randomAnime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Recomendaciones para ti
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {[...Array(24)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {recommendations.map((anime, index) => (
                  <AnimeCard key={anime.mal_id} anime={anime} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-xl">
                <p className="text-xl text-foreground/60">
                  No se encontraron animes con estos géneros
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}



