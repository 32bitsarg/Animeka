'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faFire,
  faClock,
  faStar,
  faHeart,
  faUser,
  faTrophy,
  faEye,
  faEyeSlash,
  faSearch,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'
import { Container, Section } from '@/components/ui'
import Image from 'next/image'
import Link from 'next/link'
import { getTopRatedAnime } from '@/lib/services/jikan'
import type { Anime } from '@/lib/types/anime'
import AnimeCard from '@/components/AnimeCard'

interface Recommendation {
  id: string
  userId: string
  animeId: number
  animeTitle: string
  animeImage: string | null
  content: string
  rating: number
  spoilers: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
  likes: { userId: string }[]
  _count: {
    likes: number
  }
}

const FILTER_TABS = [
  { key: 'recent', label: 'Recientes', icon: faClock },
  { key: 'popular', label: 'Populares', icon: faFire },
  { key: 'top-rated', label: 'Mejor Valorados', icon: faStar },
]

export default function RecomendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('recent')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showOpinionModal, setShowOpinionModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [topAnimes, setTopAnimes] = useState<Anime[]>([])

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrentUserId(data.user.id)
          }
        })
        .catch(err => console.error('Error fetching user:', err))
    }
  }, [session])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchRecommendations()
  }, [activeFilter])

  useEffect(() => {
    // Cargar top animes para el sidebar
    async function fetchTopAnimes() {
      try {
        const data = await getTopRatedAnime(1, 10)
        if (data?.data) {
          setTopAnimes(data.data.filter(anime => anime.type === 'TV').slice(0, 10))
        }
      } catch (error) {
        console.error('Error fetching top animes:', error)
      }
    }
    fetchTopAnimes()
  }, [])

  async function fetchRecommendations() {
    setLoading(true)
    try {
      const response = await fetch(`/api/recommendations?sort=${activeFilter}&limit=50`)
      const data = await response.json()
      if (data.success) {
        setRecommendations(data.data)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleLike(recommendationId: string) {
    try {
      const response = await fetch(`/api/recommendations/${recommendationId}/like`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.success) {
        fetchRecommendations()
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#CF50F2] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-foreground/60">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Feed - Estilo Facebook */}
          <div className="flex-1 max-w-2xl mx-auto">
            {/* Header del Feed */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-4xl font-poppins font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2] mb-2">
                Comunidad Animeka
              </h1>
              <p className="text-foreground/70">
                Comparte tus animes favoritos y conecta con otros fans
              </p>
            </motion.div>

            {/* Crear Post - Estilo Facebook */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 backdrop-blur-sm rounded-2xl border border-[#5a3d8f]/30 p-6 mb-6 shadow-lg"
            >
              <div className="flex gap-4 mb-4">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Usuario'}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CF50F2] to-[#8552F2] flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex-1 px-4 py-3 rounded-xl bg-[#382059]/30 hover:bg-[#382059]/50 border border-[#5a3d8f]/30 text-left text-foreground/70 hover:text-foreground transition-all"
                    >
                      <span className="text-sm">¿Qué anime quieres recomendar?</span>
                    </button>
                    <button
                      onClick={() => setShowOpinionModal(true)}
                      className="px-4 py-3 rounded-xl bg-[#382059]/30 hover:bg-[#382059]/50 border border-[#5a3d8f]/30 text-foreground/70 hover:text-foreground transition-all"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[#5a3d8f]/30">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-[#382059]/30 transition-colors text-foreground/70 hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                  <span className="text-sm font-medium">Recomendar Anime</span>
                </button>
                <button
                  onClick={() => setShowOpinionModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-[#382059]/30 transition-colors text-foreground/70 hover:text-foreground"
                >
                  <FontAwesomeIcon icon={faUser} className="text-blue-400" />
                  <span className="text-sm font-medium">Compartir Opinión</span>
                </button>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 mb-6 overflow-x-auto pb-2"
            >
              {FILTER_TABS.map((tab) => (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    activeFilter === tab.key
                      ? 'bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white shadow-lg'
                      : 'bg-[#382059]/20 hover:bg-[#382059]/40 text-foreground/70'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Feed de Posts */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#382059]/20 rounded-2xl h-64" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <FacebookPostCard
                    key={rec.id}
                    recommendation={rec}
                    index={index}
                    onLike={toggleLike}
                    currentUserId={currentUserId}
                  />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-gradient-to-br from-[#382059]/20 to-[#2a1844]/20 backdrop-blur-sm rounded-2xl border border-[#5a3d8f]/30"
              >
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-2">
                  Sé el primero en compartir
                </h3>
                <p className="text-foreground/60 mb-6">
                  Comparte tu anime favorito o tu opinión con la comunidad
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Top Animes */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 backdrop-blur-sm rounded-2xl border border-[#5a3d8f]/30 p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-xl" />
                  <h2 className="text-xl font-poppins font-bold text-foreground">
                    Top 10 Animes
                  </h2>
                </div>
                <div className="space-y-3">
                  {topAnimes.length > 0 ? (
                    topAnimes.map((anime, index) => (
                      <Link
                        key={anime.mal_id}
                        href={`/anime/${anime.mal_id}`}
                        className="flex gap-3 p-3 rounded-xl hover:bg-[#382059]/30 transition-all group"
                      >
                        <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <Image
                            src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
                            alt={anime.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#CF50F2] to-[#8552F2] flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-[#CF50F2] transition-colors">
                            {anime.title}
                          </h3>
                          {anime.score && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-foreground/60">
                              <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                              <span>{anime.score}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-foreground/60">
                      <div className="animate-spin w-8 h-8 border-2 border-[#CF50F2] border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">Cargando...</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* Modal Create Recommendation */}
      {showCreateModal && (
        <CreateRecommendationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchRecommendations()
          }}
        />
      )}

      {/* Modal Share Opinion */}
      {showOpinionModal && (
        <ShareOpinionModal
          onClose={() => setShowOpinionModal(false)}
          onSuccess={() => {
            setShowOpinionModal(false)
            fetchRecommendations()
          }}
        />
      )}
    </div>
  )
}

// Componente de Post estilo Facebook
function FacebookPostCard({
  recommendation,
  index,
  onLike,
  currentUserId,
}: {
  recommendation: Recommendation
  index: number
  onLike: (id: string) => void
  currentUserId: string | null
}) {
  const [showSpoilers, setShowSpoilers] = useState(false)
  const isLiked = currentUserId ? recommendation.likes.some(like => like.userId === currentUserId) : false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 backdrop-blur-sm rounded-2xl border border-[#5a3d8f]/30 shadow-lg overflow-hidden"
    >
      {/* Header del Post - Usuario */}
      <div className="p-4 flex items-center gap-3 border-b border-[#5a3d8f]/30">
        {recommendation.user.image ? (
          <Image
            src={recommendation.user.image}
            alt={recommendation.user.name || 'Usuario'}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CF50F2] to-[#8552F2] flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-foreground">
            {recommendation.user.name || 'Usuario'}
          </div>
          <div className="text-xs text-foreground/60">
            {new Date(recommendation.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
        {recommendation.rating > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-[#CF50F2] to-[#8552F2]">
            <FontAwesomeIcon icon={faStar} className="text-yellow-300 text-xs" />
            <span className="text-white font-bold text-sm">{recommendation.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Contenido del Post */}
      <div className="p-4">
        {/* Anime Info si tiene (solo si no es opinión general) */}
        {recommendation.animeTitle && recommendation.animeTitle !== 'Opinión General' && recommendation.animeId > 0 && (
          <Link href={`/anime/${recommendation.animeId}`}>
            <div className="mb-3 p-3 rounded-xl bg-[#382059]/20 hover:bg-[#382059]/30 transition-colors border border-[#5a3d8f]/20">
              <div className="flex gap-3">
                {recommendation.animeImage && (
                  <div className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={recommendation.animeImage}
                      alt={recommendation.animeTitle}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#CF50F2] line-clamp-2 mb-1">
                    {recommendation.animeTitle}
                  </h3>
                  <p className="text-xs text-foreground/60">Anime recomendado</p>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Texto del Post */}
        <div className="mb-3">
          {recommendation.spoilers && !showSpoilers ? (
            <button
              onClick={() => setShowSpoilers(true)}
              className="w-full px-4 py-3 rounded-lg bg-[#382059]/30 border border-[#5a3d8f]/50 text-foreground/70 hover:bg-[#382059]/50 transition-all flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faEyeSlash} />
              <span>Contiene Spoilers - Click para ver</span>
            </button>
          ) : (
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {recommendation.content}
            </p>
          )}
        </div>

        {recommendation.spoilers && showSpoilers && (
          <div className="mb-3 px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-semibold inline-block">
            ⚠️ Spoilers
          </div>
        )}
      </div>

      {/* Imagen del Anime si existe (solo si no es opinión general) */}
      {recommendation.animeImage && recommendation.animeTitle !== 'Opinión General' && (
        <div className="relative w-full h-64 overflow-hidden">
          <Image
            src={recommendation.animeImage}
            alt={recommendation.animeTitle}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Acciones del Post - Estilo Facebook */}
      <div className="px-4 py-3 border-t border-[#5a3d8f]/30">
        <div className="flex items-center justify-between text-sm text-foreground/60 mb-2">
          <div className="flex items-center gap-4">
            <span>{recommendation._count.likes} me gusta</span>
          </div>
        </div>
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLike(recommendation.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLiked
                ? 'bg-[#ef4444]/20 text-[#ef4444]'
                : 'hover:bg-[#382059]/30 text-foreground/70'
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className={isLiked ? 'animate-pulse' : ''} />
            <span className="font-medium">Me gusta</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export function CreateRecommendationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [step, setStep] = useState<'search' | 'form'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedAnime, setSelectedAnime] = useState<any>(null)
  const [formData, setFormData] = useState({
    content: '',
    rating: 5,
    spoilers: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    setError('')
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchQuery)}&limit=10`)
      const data = await response.json()
      setSearchResults(data.data || [])
    } catch (err) {
      setError('Error al buscar animes')
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  function selectAnime(anime: any) {
    setSelectedAnime(anime)
    setStep('form')
  }

  async function handleSubmit() {
    if (!selectedAnime) return
    if (!formData.content.trim()) {
      setError('La reseña no puede estar vacía')
      return
    }
    if (formData.content.length < 50) {
      setError('La reseña debe tener al menos 50 caracteres')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeId: selectedAnime.mal_id,
          animeTitle: selectedAnime.title,
          animeImage: selectedAnime.images?.webp?.large_image_url || selectedAnime.images?.jpg?.large_image_url,
          content: formData.content,
          rating: formData.rating,
          spoilers: formData.spoilers,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Error al crear recomendación')
      }
    } catch (err) {
      setError('Error al crear recomendación')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-gradient-to-br from-[#382059] to-[#2a1844] rounded-3xl border-2 border-[#CF50F2]/30 shadow-2xl shadow-[#CF50F2]/20 p-8 my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#382059]/50 hover:bg-[#382059] text-foreground/60 hover:text-foreground transition-all"
        >
          ✕
        </button>

        <h2 className="text-3xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-6">
          {step === 'search' ? 'Buscar Anime' : 'Escribe tu Recomendación'}
        </h2>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-error/20 border border-error/50 text-error">
            {error}
          </div>
        )}

        {step === 'search' ? (
          <div>
            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Busca un anime..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#0D0D0D]/50 border-2 border-[#5a3d8f]/30 focus:border-[#CF50F2] outline-none text-foreground placeholder:text-foreground/40"
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold hover:shadow-lg hover:shadow-[#CF50F2]/30 transition-all disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {searching ? (
                <div className="text-center py-10">
                  <div className="animate-spin w-12 h-12 border-4 border-[#CF50F2] border-t-transparent rounded-full mx-auto" />
                  <p className="text-foreground/60 mt-4">Buscando...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((anime) => (
                  <motion.div
                    key={anime.mal_id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => selectAnime(anime)}
                    className="flex gap-4 p-4 rounded-xl bg-[#0D0D0D]/30 hover:bg-[#0D0D0D]/50 border border-[#5a3d8f]/30 hover:border-[#CF50F2]/50 cursor-pointer transition-all"
                  >
                    <Image
                      src={anime.images?.webp?.image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      width={80}
                      height={120}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#CF50F2] mb-1">{anime.title}</h3>
                      <p className="text-sm text-foreground/60 mb-2">{anime.type} • {anime.episodes || '?'} eps</p>
                      {anime.score && (
                        <div className="flex items-center gap-1 text-sm">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                          <span className="text-foreground/80">{anime.score}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-10 text-foreground/60">
                  No se encontraron resultados
                </div>
              ) : (
                <div className="text-center py-10 text-foreground/60">
                  Busca un anime para comenzar
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Selected Anime Preview */}
            {selectedAnime && (
              <div className="flex gap-4 p-4 mb-6 rounded-xl bg-[#0D0D0D]/30 border border-[#5a3d8f]/30">
                <Image
                  src={selectedAnime.images?.webp?.image_url || selectedAnime.images?.jpg?.image_url}
                  alt={selectedAnime.title}
                  width={80}
                  height={120}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[#CF50F2] mb-1">{selectedAnime.title}</h3>
                  <p className="text-sm text-foreground/60">{selectedAnime.type} • {selectedAnime.episodes || '?'} eps</p>
                </div>
                <button
                  onClick={() => setStep('search')}
                  className="text-foreground/60 hover:text-foreground text-sm"
                >
                  Cambiar
                </button>
              </div>
            )}

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Tu Puntuación: <span className="text-[#CF50F2] text-2xl font-bold">{formData.rating}/10</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#382059]"
                style={{
                  background: `linear-gradient(to right, #CF50F2 0%, #CF50F2 ${formData.rating * 10}%, #382059 ${formData.rating * 10}%, #382059 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-foreground/40 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            {/* Review */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Tu Reseña (mínimo 50 caracteres)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Comparte tu opinión sobre este anime..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl bg-[#0D0D0D]/50 border-2 border-[#5a3d8f]/30 focus:border-[#CF50F2] outline-none text-foreground placeholder:text-foreground/40 resize-none"
              />
              <div className="text-right text-sm mt-1">
                <span className={formData.content.length >= 50 ? 'text-[#10b981]' : 'text-foreground/40'}>
                  {formData.content.length}/50
                </span>
              </div>
            </div>

            {/* Spoilers */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.spoilers}
                  onChange={(e) => setFormData({ ...formData, spoilers: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-[#5a3d8f] bg-[#0D0D0D]/50 checked:bg-[#CF50F2] checked:border-[#CF50F2]"
                />
                <span className="text-foreground/80">
                  <FontAwesomeIcon icon={faEye} className="mr-2 text-[#f59e0b]" />
                  Mi reseña contiene spoilers
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('search')}
                className="flex-1 px-6 py-3 rounded-xl bg-[#382059]/50 hover:bg-[#382059] text-foreground font-bold transition-all"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || formData.content.length < 50}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold hover:shadow-lg hover:shadow-[#CF50F2]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publicando...' : 'Publicar Recomendación'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// Modal para compartir opiniones (sin anime)
function ShareOpinionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!content.trim()) {
      setError('La opinión no puede estar vacía')
      return
    }
    if (content.length < 20) {
      setError('La opinión debe tener al menos 20 caracteres')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Enviar opinión sin anime (animeId y animeTitle opcionales)
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeTitle: 'Opinión General',
          animeImage: null,
          content: content,
          rating: 0,
          spoilers: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        setError(data.error || 'Error al compartir opinión')
      }
    } catch (err) {
      setError('Error al compartir opinión')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-gradient-to-br from-[#382059] to-[#2a1844] rounded-3xl border-2 border-[#CF50F2]/30 shadow-2xl shadow-[#CF50F2]/20 p-8 my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#382059]/50 hover:bg-[#382059] text-foreground/60 hover:text-foreground transition-all"
        >
          ✕
        </button>

        <h2 className="text-3xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-6">
          Comparte tu Opinión
        </h2>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-error/20 border border-error/50 text-error">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            ¿Qué opinas? (mínimo 20 caracteres)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte tus pensamientos sobre anime, la comunidad, o cualquier cosa relacionada..."
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-[#0D0D0D]/50 border-2 border-[#5a3d8f]/30 focus:border-[#CF50F2] outline-none text-foreground placeholder:text-foreground/40 resize-none"
          />
          <div className="text-right text-sm mt-1">
            <span className={content.length >= 20 ? 'text-[#10b981]' : 'text-foreground/40'}>
              {content.length}/20
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl bg-[#382059]/50 hover:bg-[#382059] text-foreground font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || content.length < 20}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold hover:shadow-lg hover:shadow-[#CF50F2]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publicando...' : 'Publicar Opinión'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

