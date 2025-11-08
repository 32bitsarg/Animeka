'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AnimeCard from '@/components/AnimeCard'
import Loading, { LoadingCard } from '@/components/Loading'
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
  { key: 'all', label: 'Todos', emoji: '📚' },
  { key: 'WATCHING', label: 'Viendo', emoji: '▶️' },
  { key: 'COMPLETED', label: 'Completados', emoji: '✅' },
  { key: 'PLAN_TO_WATCH', label: 'Planeo ver', emoji: '📝' },
  { key: 'ON_HOLD', label: 'En espera', emoji: '⏸️' },
  { key: 'DROPPED', label: 'Abandonados', emoji: '❌' },
]

export default function MyListPage() {
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
    <div className="min-h-screen py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Mi Lista de Anime</h1>
          <p className="text-sm sm:text-base text-foreground/70">
            Gestiona tu colección personal de anime
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 overflow-x-auto"
        >
          <div className="flex space-x-2 min-w-max pb-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-xs sm:text-sm md:text-base ${
                  activeTab === tab.key
                    ? 'gradient-primary text-white shadow-lg'
                    : 'bg-card hover:bg-card-hover'
                }`}
              >
                <span className="mr-1 sm:mr-2">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <StatCard
            label="Total"
            value={entries.length}
            emoji="📚"
          />
          <StatCard
            label="Viendo"
            value={entries.filter(e => e.status === 'WATCHING').length}
            emoji="▶️"
          />
          <StatCard
            label="Completados"
            value={entries.filter(e => e.status === 'COMPLETED').length}
            emoji="✅"
          />
          <StatCard
            label="Favoritos"
            value={entries.filter(e => e.isFavorite).length}
            emoji="❤️"
          />
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {entries.map((entry, index) => {
              const anime = animeData.get(entry.animeId)
              if (!anime) return null
              return (
                <div key={entry.id} className="relative">
                  <AnimeCard anime={anime} index={index} />
                  <div className="mt-2 p-2 sm:p-2.5 bg-card rounded-lg text-xs sm:text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/70">Progreso:</span>
                      <span className="font-semibold">{entry.progress} eps</span>
                    </div>
                    {entry.score && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-foreground/70">Tu nota:</span>
                        <span className="font-semibold">{entry.score}/10</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-card rounded-xl"
          >
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-2xl font-bold mb-2">Tu lista está vacía</h3>
            <p className="text-foreground/60 mb-6">
              Comienza a añadir animes para trackear tu progreso
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/discover')}
              className="px-6 py-3 rounded-lg gradient-primary text-white font-medium"
            >
              Descubrir Anime
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-card p-4 sm:p-5 md:p-6 rounded-xl text-center border border-border hover:border-primary transition-all"
    >
      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{emoji}</div>
      <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs sm:text-sm text-foreground/60">{label}</div>
    </motion.div>
  )
}




