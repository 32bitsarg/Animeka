'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
  faChartLine
} from '@fortawesome/free-solid-svg-icons'
import AnimeCard from '@/components/AnimeCard'
import Loading, { LoadingCard } from '@/components/Loading'
import { Container, Section } from '@/components/ui'
import { getAnimeById } from '@/lib/services/jikan'
import type { Anime } from '@/lib/types/anime'

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
  const [activeTab, setActiveTab] = useState('all')
  const [entries, setEntries] = useState<AnimeListEntry[]>([])
  const [animeData, setAnimeData] = useState<Map<number, Anime>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [sessionStatus, router])

  useEffect(() => {
    if (session?.user) {
      fetchMyList()
    }
  }, [session, activeTab])

  async function fetchMyList() {
    setLoading(true)
    try {
      const url = activeTab === 'all' 
        ? '/api/anime-list' 
        : `/api/anime-list?status=${activeTab}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.data) {
        setEntries(data.data)
        
        // Fetch anime data for each entry
        const animeMap = new Map()
        for (const entry of data.data) {
          const anime = await getAnimeById(entry.animeId)
          if (anime) {
            animeMap.set(entry.animeId, anime)
          }
        }
        setAnimeData(animeMap)
      }
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section con info del usuario */}
      <Section background="transparent" spacing="lg" className="pt-8">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#382059] via-[#2a1844] to-[#1d0f30] border-2 border-[#CF50F2]/30 shadow-2xl shadow-[#CF50F2]/20 p-8 md:p-12"
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CF50F2]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8552F2]/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#CF50F2] to-[#8552F2] flex items-center justify-center shadow-lg shadow-[#CF50F2]/50">
                  <FontAwesomeIcon icon={faUser} className="text-white text-5xl" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#10b981] border-4 border-[#382059] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </motion.div>

              {/* Info del usuario */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-poppins font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2] mb-3">
                  {session.user?.name || 'Usuario'}
                </h1>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-foreground/70 mb-6">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faEnvelope} className="text-[#AC79F2]" />
                    <span className="text-sm">{session.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="text-[#AC79F2]" />
                    <span className="text-sm">Miembro desde {new Date().getFullYear()}</span>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="px-4 py-2 rounded-full bg-[#CF50F2]/20 border border-[#CF50F2]/30">
                    <span className="text-[#CF50F2] font-bold">{stats.total}</span>
                    <span className="text-foreground/60 text-sm ml-2">Total</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#10b981]/20 border border-[#10b981]/30">
                    <span className="text-[#10b981] font-bold">{stats.completed}</span>
                    <span className="text-foreground/60 text-sm ml-2">Completados</span>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-[#8552F2]/20 border border-[#8552F2]/30">
                    <span className="text-[#8552F2] font-bold">{stats.averageScore}</span>
                    <span className="text-foreground/60 text-sm ml-2">Promedio</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </Section>

      {/* Estadísticas detalladas */}
      <Section background="transparent" spacing="md">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            <StatCard
              icon={faTv}
              label="Total"
              value={stats.total}
              color="#AC79F2"
            />
            <StatCard
              icon={faPlay}
              label="Viendo"
              value={stats.watching}
              color="#10b981"
            />
            <StatCard
              icon={faCheckCircle}
              label="Completados"
              value={stats.completed}
              color="#CF50F2"
            />
            <StatCard
              icon={faClock}
              label="Por ver"
              value={stats.planToWatch}
              color="#8552F2"
            />
            <StatCard
              icon={faHeart}
              label="Favoritos"
              value={stats.favorites}
              color="#ef4444"
            />
            <StatCard
              icon={faStar}
              label="Promedio"
              value={stats.averageScore}
              color="#f59e0b"
            />
          </motion.div>
        </Container>
      </Section>

      {/* Tabs de filtrado */}
      <Section background="transparent" spacing="md">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] to-[#8552F2] mb-6">
              Mi Colección
            </h2>
            
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              {STATUS_TABS.map((tab) => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap border-2 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white shadow-lg shadow-[#CF50F2]/30 border-transparent'
                      : 'bg-[#382059]/20 hover:bg-[#382059]/40 border-[#5a3d8f]/30'
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

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
        </Container>
      </Section>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#382059]/40 to-[#2a1844]/40 backdrop-blur-sm p-6 text-center border-2 border-[#5a3d8f]/30 hover:border-[#CF50F2]/50 transition-all shadow-lg hover:shadow-2xl hover:shadow-[#CF50F2]/20"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#CF50F2]/10 to-transparent rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div 
          className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20`, border: `2px solid ${color}40` }}
        >
          <FontAwesomeIcon icon={icon} style={{ color }} className="text-xl" />
        </div>
        <div className="text-3xl font-black mb-1" style={{ color }}>
          {value}
        </div>
        <div className="text-sm text-foreground/60 font-medium">{label}</div>
      </div>
    </motion.div>
  )
}

