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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section background="transparent" spacing="lg" className="pt-8">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-poppins font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2] mb-4">
              Comunidad Animeka
            </h1>
            <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Comparte tus animes favoritos, descubre nuevas joyas y conecta con otros fans
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold text-lg shadow-2xl shadow-[#CF50F2]/30 hover:shadow-[#CF50F2]/50 transition-all"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Recomendar Anime
            </motion.button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-3 mb-8"
          >
            {FILTER_TABS.map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all border-2 ${
                  activeFilter === tab.key
                    ? 'bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white shadow-lg shadow-[#CF50F2]/30 border-transparent'
                    : 'bg-[#382059]/20 hover:bg-[#382059]/40 border-[#5a3d8f]/30'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* Recommendations Grid */}
      <Section background="transparent" spacing="md">
        <Container>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-[#382059]/20 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <RecommendationCard
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
              className="text-center py-20 bg-gradient-to-br from-[#382059]/20 to-[#2a1844]/20 backdrop-blur-sm rounded-3xl border-2 border-[#5a3d8f]/30"
            >
              <div className="text-8xl mb-6">🎬</div>
              <h3 className="text-3xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-3">
                Sé el primero en recomendar
              </h3>
              <p className="text-foreground/60 mb-8 text-lg">
                Comparte tu anime favorito con la comunidad
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold shadow-lg shadow-[#CF50F2]/30"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Recomendar Ahora
              </motion.button>
            </motion.div>
          )}
        </Container>
      </Section>

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
    </div>
  )
}

function RecommendationCard({
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
      transition={{ delay: index * 0.1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 backdrop-blur-sm border-2 border-[#5a3d8f]/30 hover:border-[#CF50F2]/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-[#CF50F2]/20"
    >
      {/* Anime Image */}
      {recommendation.animeImage && (
        <div className="relative h-40 overflow-hidden">
          <Image
            src={recommendation.animeImage}
            alt={recommendation.animeTitle}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent" />
          
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#CF50F2] to-[#8552F2] backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <FontAwesomeIcon icon={faStar} className="text-yellow-300" />
            <span className="text-white font-bold">{recommendation.rating.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Anime Title */}
        <Link href={`/anime/${recommendation.animeId}`}>
          <h3 className="text-xl font-poppins font-bold text-[#CF50F2] hover:text-[#AC79F2] transition-colors mb-3 line-clamp-1">
            {recommendation.animeTitle}
          </h3>
        </Link>

        {/* User Info */}
        <div className="flex items-center gap-2 mb-4 text-sm text-foreground/60">
          <FontAwesomeIcon icon={faUser} className="text-[#AC79F2]" />
          <span>{recommendation.user.name || 'Usuario'}</span>
          <span>·</span>
          <span>{new Date(recommendation.createdAt).toLocaleDateString('es-ES')}</span>
        </div>

        {/* Review Content */}
        <div className="mb-4">
          {recommendation.spoilers && !showSpoilers ? (
            <button
              onClick={() => setShowSpoilers(true)}
              className="w-full px-4 py-3 rounded-lg bg-[#382059]/30 border border-[#5a3d8f]/50 text-foreground/70 hover:bg-[#382059]/50 transition-all flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faEyeSlash} />
              <span>Contiene Spoilers - Click para ver</span>
            </button>
          ) : (
            <p className="text-foreground/80 text-sm line-clamp-4">
              {recommendation.content}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#5a3d8f]/30">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onLike(recommendation.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLiked
                ? 'bg-[#ef4444]/20 text-[#ef4444]'
                : 'bg-[#382059]/30 text-foreground/60 hover:bg-[#382059]/50'
            }`}
          >
            <FontAwesomeIcon icon={faHeart} className={isLiked ? 'animate-pulse' : ''} />
            <span className="font-semibold">{recommendation._count.likes}</span>
          </motion.button>

          {recommendation.spoilers && (
            <div className="px-3 py-1 rounded-full bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-semibold">
              Spoilers
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CreateRecommendationModal({
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

