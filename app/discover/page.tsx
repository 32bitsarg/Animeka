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

const MOODS = [
  { emoji: '🔥', label: 'Emocionante', genres: [1, 2] },
  { emoji: '😂', label: 'Divertido', genres: [4, 36] },
  { emoji: '😢', label: 'Emocional', genres: [8, 22] },
  { emoji: '🧙', label: 'Fantástico', genres: [10, 37] },
  { emoji: '🤖', label: 'Futurista', genres: [24, 1] },
  { emoji: '💕', label: 'Romántico', genres: [22, 8] },
]

export default function DiscoverPage() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [recommendations, setRecommendations] = useState<Anime[]>([])
  const [randomAnime, setRandomAnime] = useState<Anime | null>(null)
  const [loading, setLoading] = useState(false)

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    )
  }

  const selectMood = (genreIds: number[]) => {
    setSelectedGenres(genreIds)
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
    }
  }, [selectedGenres])

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative z-10"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2]">
            Descubre tu próximo anime
          </h1>
          <p className="text-xl text-foreground/70">
            Selecciona tu mood o géneros favoritos y encuentra algo increíble
          </p>
        </motion.div>

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">¿Cómo te sientes hoy?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOODS.map((mood) => (
              <motion.button
                key={mood.label}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectMood(mood.genres)}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 hover:from-[#382059]/60 hover:to-[#2a1844]/60 border-2 border-[#5a3d8f]/30 hover:border-[#CF50F2]/50 transition-all text-center backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-[#CF50F2]/20 group overflow-hidden"
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CF50F2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                
                <div className="text-6xl mb-3 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  {mood.emoji}
                </div>
                <div className="font-semibold text-foreground relative z-10">{mood.label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Genre Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">O selecciona géneros específicos</h2>
          <div className="flex flex-wrap gap-3">
            {GENRES.map((genre) => (
              <motion.button
                key={genre.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleGenre(genre.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
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
          className="mb-12 text-center"
        >
          <p className="text-foreground/70 mb-4">¿O prefieres algo totalmente aleatorio?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRandomAnime}
            disabled={loading}
            className="px-8 py-4 rounded-xl gradient-accent text-white font-bold text-lg disabled:opacity-50"
          >
            🎲 Sorpréndeme
          </motion.button>
        </motion.div>

        {/* Random Anime Result */}
        {randomAnime && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">Tu recomendación aleatoria:</h2>
            <div className="max-w-sm mx-auto">
              <AnimeCard anime={randomAnime} />
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {selectedGenres.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6">
              Recomendaciones para ti
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(24)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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



