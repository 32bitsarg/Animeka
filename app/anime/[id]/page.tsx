'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { getAnimeById, getAnimeCharacters, getAnimeRecommendations } from '@/lib/services/jikan'
import { translateToSpanish } from '@/lib/services/translator'
import AnimeCard from '@/components/AnimeCard'
import Loading from '@/components/Loading'
import type { Anime, AnimeCharacter, AnimeRecommendation } from '@/lib/types/anime'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AnimeDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const { data: session } = useSession()
  const [anime, setAnime] = useState<Anime | null>(null)
  const [characters, setCharacters] = useState<AnimeCharacter[]>([])
  const [recommendations, setRecommendations] = useState<AnimeRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [userStatus, setUserStatus] = useState<string>('')
  const [translatedSynopsis, setTranslatedSynopsis] = useState<string>('')

  useEffect(() => {
    async function fetchAnimeData() {
      setLoading(true)
      try {
        const [animeData, charactersData, recommendationsData] = await Promise.all([
          getAnimeById(parseInt(id)),
          getAnimeCharacters(parseInt(id)),
          getAnimeRecommendations(parseInt(id)),
        ])

        if (animeData) {
          setAnime(animeData)
          // Traducir la sinopsis automáticamente
          if (animeData.synopsis) {
            console.log('📖 Original synopsis:', animeData.synopsis.substring(0, 50) + '...')
            translateToSpanish(animeData.synopsis).then(translated => {
              console.log('✅ Translated synopsis:', translated.substring(0, 50) + '...')
              setTranslatedSynopsis(translated)
            }).catch(err => {
              console.error('❌ Translation failed:', err)
              setTranslatedSynopsis(animeData.synopsis)
            })
          }
        }
        setCharacters(charactersData.slice(0, 8))
        setRecommendations(recommendationsData.slice(0, 6))
      } catch (error) {
        console.error('Error fetching anime:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimeData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Anime no encontrado</h1>
          <p className="text-foreground/60">No pudimos encontrar este anime.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
        <Image
          src={anime.images.jpg.large_image_url}
          alt={anime.title}
          fill
          className="object-cover blur-2xl opacity-30"
        />
        
        <div className="container mx-auto px-4 relative z-20 h-full flex items-end pb-16">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-shrink-0"
            >
              <div className="relative w-[250px] h-[350px] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                  alt={anime.title}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                {anime.title}
              </h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <p className="text-xl text-foreground/70 mb-4">{anime.title_english}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6">
                {anime.score && (
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm">
                    <span className="text-yellow-400 text-xl">⭐</span>
                    <span className="text-2xl font-bold">{anime.score}</span>
                    <span className="text-sm text-foreground/60">/ 10</span>
                  </div>
                )}
                {anime.rank && (
                  <div className="px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm">
                    <span className="text-foreground/70">Rank: </span>
                    <span className="font-bold">#{anime.rank}</span>
                  </div>
                )}
                {anime.popularity && (
                  <div className="px-4 py-2 rounded-lg bg-card/80 backdrop-blur-sm">
                    <span className="text-foreground/70">Popularidad: </span>
                    <span className="font-bold">#{anime.popularity}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genres?.map((genre) => (
                  <span
                    key={genre.mal_id}
                    className="px-3 py-1 rounded-full bg-primary/20 text-primary font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <InfoItem label="Tipo" value={anime.type || 'N/A'} />
                <InfoItem label="Episodios" value={anime.episodes?.toString() || '??'} />
                <InfoItem label="Estado" value={anime.status || 'N/A'} />
                <InfoItem label="Temporada" value={anime.season && anime.year ? `${anime.season} ${anime.year}` : 'N/A'} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {session && (
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-4"
          >
            <select
              value={userStatus}
              onChange={(e) => setUserStatus(e.target.value)}
              className="px-6 py-3 rounded-lg bg-card border border-border text-foreground font-medium cursor-pointer hover:border-primary transition-colors"
            >
              <option value="">Añadir a mi lista</option>
              <option value="WATCHING">Viendo</option>
              <option value="COMPLETED">Completado</option>
              <option value="ON_HOLD">En espera</option>
              <option value="DROPPED">Abandonado</option>
              <option value="PLAN_TO_WATCH">Planeo ver</option>
            </select>
            <button className="px-6 py-3 rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity">
              ❤️ Añadir a favoritos
            </button>
          </motion.div>
        </div>
      )}

      {/* Synopsis */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-4">Sinopsis</h2>
          <p className="text-foreground/80 leading-relaxed">
            {translatedSynopsis || anime.synopsis || 'No hay sinopsis disponible.'}
          </p>
          {translatedSynopsis && translatedSynopsis !== anime.synopsis && (
            <p className="text-xs text-foreground/40 mt-4 italic">
              ✨ Traducido automáticamente
            </p>
          )}
        </motion.div>
      </div>

      {/* Characters */}
      {characters.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Personajes Principales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {characters.map((char, index) => (
              <motion.div
                key={char.character.mal_id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-xl overflow-hidden hover:scale-105 transition-transform"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={char.character.images.webp.image_url}
                    alt={char.character.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-2">{char.character.name}</p>
                  <p className="text-xs text-foreground/60">{char.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Recomendaciones</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {recommendations.map((rec, index) => (
              <AnimeCard key={rec.entry.mal_id} anime={rec.entry as any} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-foreground/60 mb-1">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}


