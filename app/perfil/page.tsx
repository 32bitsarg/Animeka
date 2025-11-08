'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUser, 
  faEnvelope, 
  faCalendar,
  faTv,
  faCheckCircle,
  faHeart,
  faPlay,
  faClock,
  faPause,
  faXmark,
  faStar,
  faChartLine,
  faCamera,
  faEdit,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'
import AnimeCard from '@/components/AnimeCard'
import Loading, { LoadingCard } from '@/components/Loading'
import { Container, Section } from '@/components/ui'
import { getAnimeById } from '@/lib/services/jikan'
import type { Anime } from '@/lib/types/anime'
import Image from 'next/image'
import Link from 'next/link'
import ImageCropModal from '@/components/ImageCropModal'

interface AnimeListEntry {
  id: string
  animeId: number
  status: string
  score: number | null
  progress: number
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

interface Recommendation {
  id: string
  animeId: number
  animeTitle: string
  animeImage: string | null
  content: string
  rating: number
  spoilers: boolean
  createdAt: string
  _count: {
    likes: number
  }
}

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
  banner: string | null
  createdAt: string
  _count: {
    animeList: number
    recommendations: number
    likes: number
  }
  recommendations: Recommendation[]
}

const STATUS_TABS = [
  { key: 'all', label: 'Todos', icon: faTv, color: '#AC79F2' },
  { key: 'WATCHING', label: 'Viendo', icon: faPlay, color: '#10b981' },
  { key: 'COMPLETED', label: 'Completados', icon: faCheckCircle, color: '#CF50F2' },
  { key: 'PLAN_TO_WATCH', label: 'Planeo ver', icon: faClock, color: '#8552F2' },
  { key: 'ON_HOLD', label: 'En espera', icon: faPause, color: '#f59e0b' },
  { key: 'DROPPED', label: 'Abandonados', icon: faXmark, color: '#ef4444' },
]

export default function PerfilPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'list' | 'recommendations'>('list')
  const [statusFilter, setStatusFilter] = useState('all')
  const [entries, setEntries] = useState<AnimeListEntry[]>([])
  const [animeData, setAnimeData] = useState<Map<number, Anime>>(new Map())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editingBanner, setEditingBanner] = useState(false)
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string>('')
  const [cropType, setCropType] = useState<'avatar' | 'banner'>('avatar')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      // Cargar perfil y lista en paralelo para mejor rendimiento
      Promise.all([
        fetchProfile(),
        activeTab === 'list' ? fetchMyList() : Promise.resolve(),
      ])
    }
  }, [session, statusFilter, activeTab])

  async function fetchProfile() {
    try {
      const response = await fetch('/api/user/profile', {
        cache: 'no-store', // Evitar cache para datos actualizados
      })
      const data = await response.json()
      if (data.success) {
        setProfile(data.user)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  async function fetchMyList() {
    setLoading(true)
    try {
      const url = statusFilter === 'all' 
        ? '/api/anime-list' 
        : `/api/anime-list?status=${statusFilter}`
      
      const response = await fetch(url, {
        cache: 'no-store', // Evitar cache para datos actualizados
      })
      const data = await response.json()

      if (data.data) {
        setEntries(data.data)
        
        // Fetch anime data for each entry EN PARALELO para mejor rendimiento
        const animePromises = data.data.map((entry: AnimeListEntry) =>
          getAnimeById(entry.animeId).then(anime => ({ id: entry.animeId, anime }))
        )
        
        const animeResults = await Promise.all(animePromises)
        const animeMap = new Map()
        
        animeResults.forEach(({ id, anime }) => {
          if (anime) {
            animeMap.set(id, anime)
          }
        })
        
        setAnimeData(animeMap)
      }
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleFileSelect(file: File, type: 'avatar' | 'banner') {
    if (!file) return

    // Crear una URL temporal para la imagen
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string
      setCropImageSrc(imageSrc)
      setCropType(type)
      setPendingFile(file)
      setCropModalOpen(true)
    }
    reader.readAsDataURL(file)
  }

  async function handleCropComplete(croppedImageDataUrl: string) {
    if (!pendingFile) return

    setCropModalOpen(false)
    setUploading(true)

    try {
      // Convertir data URL a Blob de manera más directa
      const base64Data = croppedImageDataUrl.split(',')[1] || croppedImageDataUrl
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })
      
      // Crear un File desde el Blob
      const file = new File([blob], `cropped-${cropType}-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      console.log('📤 Subiendo imagen recortada:', {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Subir la imagen recortada
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', cropType)

      const uploadResponse = await fetch('/api/user/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('❌ Error HTTP:', uploadResponse.status, errorText)
        throw new Error(`Error HTTP ${uploadResponse.status}: ${errorText}`)
      }

      const data = await uploadResponse.json()

      console.log('📥 Respuesta del servidor:', data)

      if (data.success) {
        await fetchProfile()
        // Disparar evento para actualizar el Navbar
        if (cropType === 'avatar') {
          window.dispatchEvent(new CustomEvent('userImageUpdated'))
          setEditingAvatar(false)
        } else {
          setEditingBanner(false)
        }
      } else {
        console.error('❌ Error del servidor:', data.error)
        alert(data.error || 'Error al subir la imagen')
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error)
      alert(`Error al subir la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setUploading(false)
      setPendingFile(null)
    }
  }

  async function handleImageUpload(file: File, type: 'avatar' | 'banner') {
    // Esta función ahora solo abre el modal de recorte
    handleFileSelect(file, type)
  }

  const stats = {
    total: entries.length,
    watching: entries.filter(e => e.status === 'WATCHING').length,
    completed: entries.filter(e => e.status === 'COMPLETED').length,
    planToWatch: entries.filter(e => e.status === 'PLAN_TO_WATCH').length,
    favorites: entries.filter(e => e.isFavorite).length,
    averageScore: entries.filter(e => e.score).length > 0 
      ? (entries.reduce((sum, e) => sum + (e.score || 0), 0) / entries.filter(e => e.score).length).toFixed(1)
      : '0.0'
  }

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <Loading />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Mostrar loading solo si no tenemos perfil aún
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Banner y Avatar - Estilo Twitter/X */}
      <div className="relative">
        {/* Banner */}
        <div className="relative h-64 bg-gradient-to-br from-[#382059] via-[#2a1844] to-[#1d0f30]">
          {profile.banner ? (
            profile.banner.startsWith('data:') ? (
              <img
                src={profile.banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={profile.banner}
                alt="Banner"
                fill
                className="object-cover"
              />
            )
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#382059] via-[#2a1844] to-[#1d0f30]" />
          )}
          
          {/* Botón editar banner */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingBanner(true)
              bannerInputRef.current?.click()
            }}
            className="absolute top-4 right-4 px-4 py-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white font-medium transition-all flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faCamera} />
            <span className="hidden sm:inline">Editar banner</span>
          </motion.button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileSelect(file, 'banner')
              }
              // Resetear el input para permitir seleccionar el mismo archivo de nuevo
              e.target.value = ''
            }}
          />
        </div>

        {/* Avatar - Posicionado sobre el banner */}
        <Container>
          <div className="relative -mt-20 mb-4">
            <div className="relative inline-block">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#0D0D0D] overflow-hidden bg-gradient-to-br from-[#CF50F2] to-[#8552F2]">
                {profile.image ? (
                  profile.image.startsWith('data:') ? (
                    <img
                      src={profile.image}
                      alt={profile.name || 'Usuario'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={profile.image}
                      alt={profile.name || 'Usuario'}
                      fill
                      className="object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faUser} className="text-white text-5xl" />
                  </div>
                )}
              </div>
              
              {/* Botón editar avatar */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingAvatar(true)
                  avatarInputRef.current?.click()
                }}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#CF50F2] hover:bg-[#8552F2] border-4 border-[#0D0D0D] flex items-center justify-center text-white transition-all shadow-lg"
              >
                <FontAwesomeIcon icon={faCamera} className="text-sm" />
              </motion.button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(file, 'avatar')
                  }
                  // Resetear el input para permitir seleccionar el mismo archivo de nuevo
                  e.target.value = ''
                }}
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Info del usuario */}
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-poppins font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2] mb-2">
            {profile.name || 'Usuario'}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-foreground/70 mb-6">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faEnvelope} className="text-[#AC79F2]" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendar} className="text-[#AC79F2]" />
              <span className="text-sm">
                Miembro desde {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#CF50F2]">{profile._count.animeList}</div>
              <div className="text-sm text-foreground/60">Animes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#CF50F2]">{profile._count.recommendations}</div>
              <div className="text-sm text-foreground/60">Recomendaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#CF50F2]">{profile._count.likes}</div>
              <div className="text-sm text-foreground/60">Likes dados</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-[#5a3d8f]/30">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'list'
                  ? 'border-[#CF50F2] text-[#CF50F2]'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <FontAwesomeIcon icon={faTv} className="mr-2" />
              Mi Lista
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'recommendations'
                  ? 'border-[#CF50F2] text-[#CF50F2]'
                  : 'border-transparent text-foreground/60 hover:text-foreground'
              }`}
            >
              <FontAwesomeIcon icon={faStar} className="mr-2" />
              Mis Recomendaciones ({profile.recommendations.length})
            </button>
          </div>
        </motion.div>

        {/* Contenido según tab activo */}
        {activeTab === 'list' ? (
          <>
            {/* Tabs de filtrado */}
            <div className="mb-8">
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {STATUS_TABS.map((tab) => (
                  <motion.button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap border-2 ${
                      statusFilter === tab.key
                        ? 'bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white shadow-lg shadow-[#CF50F2]/30 border-transparent'
                        : 'bg-[#382059]/20 hover:bg-[#382059]/40 border-[#5a3d8f]/30'
                    }`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Lista de anime */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {[...Array(12)].map((_, i) => (
                  <LoadingCard key={i} />
                ))}
              </div>
            ) : entries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {entries.map((entry, index) => {
                  const anime = animeData.get(entry.animeId)
                  if (!anime) return null
                  return (
                    <motion.div 
                      key={entry.id} 
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <AnimeCard anime={anime} index={index} />
                      <div className="mt-2 p-3 bg-gradient-to-br from-[#382059]/30 to-[#2a1844]/30 backdrop-blur-sm rounded-xl border border-[#5a3d8f]/30 text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-foreground/70">Progreso</span>
                          <span className="font-bold text-[#CF50F2]">{entry.progress} eps</span>
                        </div>
                        {entry.score && (
                          <div className="flex justify-between items-center">
                            <span className="text-foreground/70">Tu nota</span>
                            <div className="flex items-center gap-1">
                              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                              <span className="font-bold text-[#8552F2]">{entry.score}/10</span>
                            </div>
                          </div>
                        )}
                        {entry.isFavorite && (
                          <div className="mt-2 pt-2 border-t border-[#5a3d8f]/30 flex justify-center">
                            <span className="text-xs text-[#ef4444] flex items-center gap-1">
                              <FontAwesomeIcon icon={faHeart} />
                              Favorito
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-gradient-to-br from-[#382059]/20 to-[#2a1844]/20 backdrop-blur-sm rounded-3xl border-2 border-[#5a3d8f]/30"
              >
                <div className="text-8xl mb-6">📺</div>
                <h3 className="text-3xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-3">
                  Tu lista está vacía
                </h3>
                <p className="text-foreground/60 mb-8 text-lg">
                  Comienza a añadir animes para trackear tu progreso
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/discover')}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold shadow-lg shadow-[#CF50F2]/30"
                >
                  <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                  Descubrir Anime
                </motion.button>
              </motion.div>
            )}
          </>
        ) : (
          /* Sección de Recomendaciones */
          <div className="space-y-4">
            {profile.recommendations.length > 0 ? (
              profile.recommendations.map((rec, index) => (
                <RecommendationCard key={rec.id} recommendation={rec} index={index} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-gradient-to-br from-[#382059]/20 to-[#2a1844]/20 backdrop-blur-sm rounded-3xl border-2 border-[#5a3d8f]/30"
              >
                <div className="text-8xl mb-6">💬</div>
                <h3 className="text-3xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-3">
                  Aún no has recomendado ningún anime
                </h3>
                <p className="text-foreground/60 mb-8 text-lg">
                  Comparte tus animes favoritos con la comunidad
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/recomendar')}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold shadow-lg shadow-[#CF50F2]/30"
                >
                  <FontAwesomeIcon icon={faStar} className="mr-2" />
                  Crear Recomendación
                </motion.button>
              </motion.div>
            )}
          </div>
        )}
      </Container>

      {/* Loading overlay para uploads */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-[#CF50F2] border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-white font-medium">Subiendo imagen...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de recorte de imagen */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setCropModalOpen(false)
          setPendingFile(null)
        }}
        onCropComplete={handleCropComplete}
        type={cropType}
        aspectRatio={cropType === 'avatar' ? 1 : 5}
      />
    </div>
  )
}

function RecommendationCard({ recommendation, index }: { recommendation: Recommendation; index: number }) {
  const [showSpoilers, setShowSpoilers] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 backdrop-blur-sm rounded-2xl border border-[#5a3d8f]/30 shadow-lg overflow-hidden"
    >
      <div className="p-4">
        {/* Anime Info */}
        {recommendation.animeTitle && recommendation.animeTitle !== 'Opinión General' && (
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
                  {recommendation.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                      <span className="text-sm text-foreground/70">{recommendation.rating.toFixed(1)}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Contenido */}
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#5a3d8f]/30">
          <div className="flex items-center gap-2 text-sm text-foreground/60">
            <FontAwesomeIcon icon={faHeart} className="text-red-400" />
            <span>{recommendation._count.likes} me gusta</span>
          </div>
          <div className="text-xs text-foreground/60">
            {new Date(recommendation.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
