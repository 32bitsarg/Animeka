'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay } from '@fortawesome/free-solid-svg-icons'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function Logo({ size = 'md', showIcon = true }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }

  return (
    <Link href="/">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 cursor-pointer"
      >
        {showIcon && (
          <div className="relative flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent animate-pulse opacity-80" />
            <div className="relative w-full h-full flex items-center justify-center">
              <FontAwesomeIcon icon={faPlay} className="text-white text-lg drop-shadow-lg" />
            </div>
          </div>
        )}
        <div className={`font-poppins font-black ${sizes[size]} leading-none`}>
          <span className="text-primary">Anime</span>
          <span className="text-secondary">ka</span>
        </div>
      </motion.div>
    </Link>
  )
}

