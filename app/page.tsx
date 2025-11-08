'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AnimeCard from '@/components/AnimeCard'
import SearchBar from '@/components/SearchBar'
import { LoadingCard } from '@/components/Loading'
import { HeroBanner, Section, Container, SectionHeader, AnimeGrid, Button } from '@/components/ui'
import { getCurrentSeasonAnime, getTopAnime, getTopRatedAnime } from '@/lib/services/jikan'
import type { Anime } from '@/lib/types/anime'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompass, faMagnifyingGlass, faListCheck } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export default function HomePage() {
  const [currentSeasonAnime, setCurrentSeasonAnime] = useState<Anime[]>([])
  const [popularAnime, setPopularAnime] = useState<Anime[]>([])
  const [topRatedAnime, setTopRatedAnime] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Usar Promise.allSettled para que si una falla, las otras continúen
        const results = await Promise.allSettled([
          getCurrentSeasonAnime(1),
          getTopAnime(1, 12),
          getTopRatedAnime(1, 12),
        ])

        // Procesar resultados independientemente
        if (results[0].status === 'fulfilled' && results[0].value?.data) {
          setCurrentSeasonAnime(results[0].value.data.slice(0, 12))
        }
        if (results[1].status === 'fulfilled' && results[1].value?.data) {
          setPopularAnime(results[1].value.data)
        }
        if (results[2].status === 'fulfilled' && results[2].value?.data) {
          setTopRatedAnime(results[2].value.data)
        }
      } catch (error) {
        console.error('Error fetching anime data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Banner - ESTÁTICO para mejor legibilidad */}
      <HeroBanner
        title="Descubre el Mundo del Anime"
        subtitle="Tu Portal Anime Definitivo"
        description="Explora miles de animes, crea tu lista personal y mantén un seguimiento de tus series favoritas. Todo en un solo lugar, totalmente gratis."
        imageUrl="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000"
      >
        <Link href="/discover" prefetch={true}>
          <Button size="lg" variant="primary" className="w-full sm:w-auto">
            <FontAwesomeIcon icon={faCompass} className="mr-2" />
            Descubrir Anime
          </Button>
        </Link>
        <Link href="/search" prefetch={true}>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
            Buscar
          </Button>
        </Link>
        {!loading && (
          <Link href="/auth/signup" prefetch={true}>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <FontAwesomeIcon icon={faListCheck} className="mr-2" />
              Crear Mi Lista
            </Button>
          </Link>
        )}
      </HeroBanner>

      {/* Barra de búsqueda */}
      <Section spacing="md" background="transparent" className="-mt-16 md:-mt-20">
        <Container>
          <Suspense fallback={<div className="h-16 bg-card/50 rounded-xl animate-pulse" />}>
            <LazySearchBar />
          </Suspense>
        </Container>
      </Section>

      {/* Current Season Section */}
      <Section background="default">
        <Container>
          <SectionHeader
            title="Temporada Actual"
            subtitle="Los animes que están en emisión ahora mismo"
            emoji="📺"
          />
          {loading ? (
            <AnimeGrid>
              {[...Array(12)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </AnimeGrid>
          ) : (
            <AnimeGrid>
              {currentSeasonAnime.map((anime, index) => (
                <AnimeCard 
                  key={anime.mal_id} 
                  anime={anime} 
                  index={index}
                  priority={index < 6}
                />
              ))}
            </AnimeGrid>
          )}
        </Container>
      </Section>

      {/* Popular Anime Section */}
      <Section background="card">
        <Container>
          <SectionHeader
            title="Más Populares"
            subtitle="Los animes que todo el mundo está viendo"
            emoji="🔥"
          />
          {loading ? (
            <AnimeGrid>
              {[...Array(12)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </AnimeGrid>
          ) : (
            <AnimeGrid>
              {popularAnime.map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))}
            </AnimeGrid>
          )}
        </Container>
      </Section>

      {/* Top Rated Section */}
      <Section background="default">
        <Container>
          <SectionHeader
            title="Mejor Valorados"
            subtitle="Los clásicos y obras maestras del anime"
            emoji="⭐"
          />
          {loading ? (
            <AnimeGrid>
              {[...Array(12)].map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </AnimeGrid>
          ) : (
            <AnimeGrid>
              {topRatedAnime.map((anime, index) => (
                <AnimeCard key={anime.mal_id} anime={anime} index={index} />
              ))}
            </AnimeGrid>
          )}
        </Container>
      </Section>

      {/* CTA Section */}
      <Section spacing="lg">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-xl sm:rounded-2xl gradient-primary p-6 sm:p-8 md:p-12 text-center overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                ¿Listo para comenzar tu viaje?
              </h2>
              <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                Únete a miles de fans del anime y mantén tu colección organizada
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-foreground/90 w-full sm:w-auto">
                Comenzar Ahora - Es Gratis
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  )
}
