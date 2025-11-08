'use client'

import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 rounded-full gradient-primary"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <motion.div
      className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

export function LoadingCard() {
  return (
    <motion.div 
      className="animate-pulse h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#382059] to-[#2a1844] border-2 border-[#5a3d8f]/30 shadow-xl h-full flex flex-col">
        {/* Imagen placeholder */}
        <div className="relative aspect-[2/3] bg-gradient-to-br from-[#5a3d8f]/20 to-[#382059]/40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60" />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CF50F2]/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Score badge placeholder */}
          <div className="absolute top-3 right-3 w-14 h-7 rounded-full bg-[#5a3d8f]/40" />
        </div>
        
        {/* Info placeholder */}
        <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[#382059]/20 space-y-3">
          {/* Título placeholder */}
          <div className="space-y-2">
            <div className="h-4 bg-[#5a3d8f]/40 rounded w-full" />
            <div className="h-4 bg-[#5a3d8f]/40 rounded w-3/4" />
          </div>
          
          {/* Metadata placeholder */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-[#5a3d8f]/30 rounded w-16" />
            <div className="h-3 bg-[#5a3d8f]/30 rounded w-16" />
          </div>
          
          {/* Genres placeholder */}
          <div className="flex gap-1.5 mt-auto">
            <div className="h-6 bg-[#8552F2]/20 rounded-full w-20 border border-[#8552F2]/30" />
            <div className="h-6 bg-[#8552F2]/20 rounded-full w-16 border border-[#8552F2]/30" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}


