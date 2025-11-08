'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import SearchBar from '@/components/SearchBar'
import AnimeCard from '@/components/AnimeCard'
import { LoadingCard } from '@/components/Loading'
import { searchAnime } from '@/lib/services/jikan'
import type { Anime, AnimeFilters } from '@/lib/types/anime'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [results, setResults] = useState<Anime[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<AnimeFilters>({})

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, filters, page])

  async function performSearch() {
    setLoading(true)
    try {
      const data = await searchAnime({
        q: query,
        page,
        limit: 24,
        ...filters,
      })

      if (data?.data) {
        setResults(page === 1 ? data.data : [...results, ...data.data])
        setHasMore(data.pagination.has_next_page)
      }
    } catch (error) {
      console.error('Error searching anime:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(key: keyof AnimeFilters, value: any) {
    setPage(1)
    setResults([])
    setFilters({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-center mb-8">
            Buscar Anime
          </h1>
          <SearchBar placeholder="Buscar por título..." autoFocus />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-card rounded-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
            >
              <option value="">Todos los tipos</option>
              <option value="tv">TV</option>
              <option value="movie">Película</option>
              <option value="ova">OVA</option>
              <option value="special">Especial</option>
              <option value="ona">ONA</option>
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
            >
              <option value="">Todos los estados</option>
              <option value="airing">En emisión</option>
              <option value="complete">Completado</option>
              <option value="upcoming">Próximamente</option>
            </select>

            <select
              value={filters.order_by || ''}
              onChange={(e) => handleFilterChange('order_by', e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
            >
              <option value="">Ordenar por</option>
              <option value="score">Puntuación</option>
              <option value="popularity">Popularidad</option>
              <option value="favorites">Favoritos</option>
              <option value="start_date">Fecha de inicio</option>
            </select>

            <select
              value={filters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="px-4 py-2 rounded-lg bg-background border border-border text-foreground"
            >
              <option value="">Todas las clasificaciones</option>
              <option value="g">G - Todas las edades</option>
              <option value="pg">PG - Niños</option>
              <option value="pg13">PG-13 - Adolescentes</option>
              <option value="r17">R - 17+ (violencia y profanidad)</option>
              <option value="r">R+ - Mild Nudity</option>
            </select>
          </div>
        </motion.div>

        {/* Results */}
        {query && (
          <div className="mb-4">
            <p className="text-foreground/70">
              {loading && page === 1 ? 'Buscando...' : `Resultados para "${query}"`}
            </p>
          </div>
        )}

        {loading && page === 1 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(24)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {results.map((anime, index) => (
                <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} index={index} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(page + 1)}
                  disabled={loading}
                  className="px-8 py-3 rounded-lg gradient-primary text-white font-medium disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </motion.button>
              </div>
            )}
          </>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-2xl font-bold mb-2">No se encontraron resultados</p>
            <p className="text-foreground/60">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl font-bold mb-2">🔍 Comienza tu búsqueda</p>
            <p className="text-foreground/60">Escribe el nombre de un anime para buscar</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <SearchContent />
    </Suspense>
  )
}




