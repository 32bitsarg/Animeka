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
      const data = await getAnimeByGenres(selectedGenres)
      if (data?.data) {
        setRecommendations(data.data.slice(0, 24))
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
      const anime = await getRandomAnime()
      if (anime) {
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
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-primary bg-clip-text text-transparent">
              Descubre tu próximo anime
            </span>
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectMood(mood.genres)}
                className="p-6 rounded-xl bg-card hover:bg-card-hover border-2 border-border hover:border-primary transition-all text-center"
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="font-semibold">{mood.label}</div>
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


