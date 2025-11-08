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
        const [seasonData, popularData, topRatedData] = await Promise.all([
          getCurrentSeasonAnime(1),
          getTopAnime(1, 12),
          getTopRatedAnime(1, 12),
        ])

        if (seasonData?.data) setCurrentSeasonAnime(seasonData.data.slice(0, 12))
        if (popularData?.data) setPopularAnime(popularData.data)
        if (topRatedData?.data) setTopRatedAnime(topRatedData.data)
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
        <div className="flex flex-wrap gap-4">
          <Link href="/discover">
            <Button size="lg" variant="primary">
              <FontAwesomeIcon icon={faCompass} className="mr-2" />
              Descubrir Anime
            </Button>
          </Link>
          <Link href="/search">
            <Button size="lg" variant="outline">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="mr-2" />
              Buscar
            </Button>
          </Link>
          {!loading && (
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                <FontAwesomeIcon icon={faListCheck} className="mr-2" />
                Crear Mi Lista
              </Button>
            </Link>
          )}
        </div>
      </HeroBanner>

      {/* Barra de búsqueda */}
      <Section spacing="md" background="transparent" className="-mt-20">
        <Container>
          <SearchBar />
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
            className="relative rounded-2xl gradient-primary p-12 text-center overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                ¿Listo para comenzar tu viaje?
              </h2>
              <p className="text-white/90 text-lg mb-8">
                Únete a miles de fans del anime y mantén tu colección organizada
              </p>
              <Button size="lg" className="bg-white text-primary hover:bg-foreground/90">
                Comenzar Ahora - Es Gratis
              </Button>
            </div>
          </motion.div>
        </Container>
      </Section>
    </div>
  )
}
