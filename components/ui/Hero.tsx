'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStar, faFireFlameCurved } from '@fortawesome/free-solid-svg-icons'

interface HeroProps {
  title: string
  subtitle?: string
  gradient?: boolean
  children?: ReactNode
  className?: string
  showStats?: boolean
}

export default function Hero({ 
  title, 
  subtitle, 
  gradient = true, 
  children, 
  className = '',
  showStats = true
}: HeroProps) {
  return (
    <section className={`relative py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden ${className}`}>
      {/* Background decorativo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-30" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Logo o badge superior */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
          >
            <FontAwesomeIcon icon={faPlay} className="text-primary" />
            <span className="text-sm font-poppins font-medium text-primary">
              Tu colección anime personal
            </span>
          </motion.div>

          {/* Título principal espectacular */}
          <h1 className="font-poppins font-black mb-6 leading-tight">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl"
            >
              <span className="block gradient-primary bg-clip-text text-transparent">
                {title}
              </span>
            </motion.div>
          </h1>
          
          {/* Subtítulo elegante */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto font-inter"
            >
              {subtitle}
            </motion.p>
          )}
          
          {/* Contenido (SearchBar u otros elementos) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {children}
          </motion.div>

          {/* Stats decorativos */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12"
            >
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faStar} className="text-yellow-400" size="lg" />
                <span className="font-poppins text-foreground/70 text-sm sm:text-base">
                  <span className="font-bold text-xl sm:text-2xl text-foreground">10K+</span> Animes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faFireFlameCurved} className="text-orange-400" size="lg" />
                <span className="font-poppins text-foreground/70 text-sm sm:text-base">
                  <span className="font-bold text-xl sm:text-2xl text-foreground">100%</span> Gratis
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faPlay} className="text-primary" size="lg" />
                <span className="font-poppins text-foreground/70 text-sm sm:text-base">
                  <span className="font-bold text-xl sm:text-2xl text-foreground">24/7</span> Actualizado
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

