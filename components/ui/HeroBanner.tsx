'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import Image from 'next/image'

interface HeroBannerProps {
  title: string
  subtitle?: string
  description?: string
  imageUrl?: string
  children?: ReactNode
  className?: string
}

export default function HeroBanner({ 
  title, 
  subtitle,
  description,
  imageUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000',
  children, 
  className = ''
}: HeroBannerProps) {
  return (
    <section className={`relative h-[600px] md:h-[700px] overflow-hidden ${className}`}>
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          quality={75}
        />
        {/* Overlay con gradientes múltiples para mejor legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-end pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            {subtitle && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-2 mb-4"
              >
                <div className="w-1 h-6 bg-primary rounded-full" />
                <span className="text-primary font-poppins font-semibold text-sm md:text-base uppercase tracking-wider">
                  {subtitle}
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl font-poppins font-black text-foreground mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl font-inter leading-relaxed"
              >
                {description}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decoración inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}

