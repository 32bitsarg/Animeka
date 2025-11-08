'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faArrowRight } from '@fortawesome/free-solid-svg-icons'

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Busca tu anime favorito...', 
  autoFocus = false 
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim())
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      }
    }
  }

  const quickSearches = ['One Piece', 'Naruto', 'Attack on Titan', 'Demon Slayer']

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`
          transition-all duration-300
          ${isFocused ? 'scale-105' : 'scale-100'}
        `}
      >
        <div className="relative group">
          {/* Icono de búsqueda */}
          <div className="absolute left-3 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <FontAwesomeIcon 
              icon={faMagnifyingGlass} 
              className={`transition-colors text-sm sm:text-base md:text-lg ${isFocused ? 'text-primary' : 'text-foreground/40'}`}
            />
          </div>

          {/* Input principal */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="
              w-full pl-12 sm:pl-16 pr-[100px] sm:pr-[140px] py-3 sm:py-4 md:py-5 
              rounded-xl sm:rounded-2xl
              bg-card/90 backdrop-blur-md
              border-2 border-border
              text-foreground text-sm sm:text-base md:text-lg
              placeholder-foreground/40
              focus:border-primary focus:bg-card
              focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-primary/20
              transition-all duration-300
              group-hover:border-primary/50
              font-inter
            "
          />

          {/* Botón de buscar mejorado - posición fija */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!query.trim()}
            className={`
              absolute right-2 sm:right-3 top-1/2 -translate-y-1/2
              px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3
              rounded-lg sm:rounded-xl
              gradient-primary
              text-white font-poppins font-semibold text-xs sm:text-sm md:text-base
              flex items-center space-x-1 sm:space-x-2
              transition-opacity duration-300
              ${query.trim() ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}
              hover:shadow-lg hover:shadow-primary/50
              z-20
            `}
          >
            <span className="hidden sm:inline">Buscar</span>
            <FontAwesomeIcon icon={faArrowRight} className="text-xs sm:text-sm" />
          </motion.button>

          {/* Efecto de glow al hacer focus */}
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-2xl bg-primary/10 -z-10 blur-xl"
            />
          )}
        </div>
      </motion.form>

      {/* Sugerencias rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6"
      >
        <span className="text-xs sm:text-sm text-foreground/50 font-inter hidden sm:inline">Popular:</span>
        {quickSearches.map((anime) => (
          <button
            key={anime}
            type="button"
            onClick={() => {
              setQuery(anime)
              if (onSearch) {
                onSearch(anime)
              } else {
                router.push(`/search?q=${encodeURIComponent(anime)}`)
              }
            }}
            className="px-2 sm:px-3 py-1 rounded-full bg-card/50 hover:bg-card text-xs sm:text-sm text-foreground/70 hover:text-primary transition-all duration-200 border border-border hover:border-primary/50 font-inter"
          >
            {anime}
          </button>
        ))}
      </motion.div>
    </div>
  )
}
