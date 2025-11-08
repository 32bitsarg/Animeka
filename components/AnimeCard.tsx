'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Badge from './ui/Badge'
import type { Anime } from '@/lib/types/anime'

interface AnimeCardProps {
  anime: Anime
  index?: number
  priority?: boolean
}

export default function AnimeCard({ anime, index = 0, priority = false }: AnimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -12 }}
      className="group relative h-full"
    >
      <Link href={`/anime/${anime.mal_id}`} className="block h-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#382059] to-[#2a1844] border-2 border-[#5a3d8f]/30 hover:border-[#CF50F2] transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-[#CF50F2]/40 h-full flex flex-col">
          {/* Imagen */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
              alt={anime.title}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            
            {/* Overlay con gradiente mejorado */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#CF50F2]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Score badge - Moderno */}
            {anime.score && (
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#CF50F2] to-[#8552F2] backdrop-blur-md flex items-center space-x-1.5 shadow-lg"
              >
                <span className="text-yellow-300 text-lg">★</span>
                <span className="text-sm font-black text-white">{anime.score}</span>
              </motion.div>
            )}

            {/* Status badge - Moderno */}
            {anime.airing && (
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#10b981] to-[#059669] backdrop-blur-md shadow-lg"
              >
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wide">En Vivo</span>
                </div>
              </motion.div>
            )}

            {/* Rank badge si existe */}
            {anime.rank && anime.rank <= 100 && (
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#382059]/90 backdrop-blur-md border border-[#AC79F2]/50">
                <span className="text-xs font-bold text-[#AC79F2]">#{anime.rank}</span>
              </div>
            )}
          </div>

          {/* Info - Diseño mejorado */}
          <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[#382059]/20">
            <h3 className="font-poppins font-bold text-foreground line-clamp-2 mb-3 text-base group-hover:text-[#CF50F2] transition-colors duration-300">
              {anime.title}
            </h3>
            
            {/* Metadata con iconos */}
            <div className="flex items-center justify-between text-sm text-foreground/70 mb-3">
              <div className="flex items-center space-x-1.5">
                <span className="text-[#AC79F2]">📺</span>
                <span className="font-medium">{anime.type}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[#AC79F2]">🎬</span>
                <span className="font-medium">{anime.episodes ? `${anime.episodes} eps` : '?? eps'}</span>
              </div>
            </div>

            {/* Genres - Estilo mejorado */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {anime.genres.slice(0, 2).map((genre) => (
                  <span 
                    key={genre.mal_id}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8552F2]/20 text-[#AC79F2] border border-[#8552F2]/30 hover:bg-[#8552F2]/30 transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
                {anime.genres.length > 2 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#CF50F2]/20 text-[#CF50F2] border border-[#CF50F2]/30">
                    +{anime.genres.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Efecto de brillo en hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#CF50F2]/50 ring-offset-2 ring-offset-[#0D0D0D]"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}


