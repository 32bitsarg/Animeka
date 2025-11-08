'use client'

import { motion } from 'framer-motion'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  emoji?: string
  icon?: IconDefinition
  className?: string
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  emoji,
  icon, 
  className = '' 
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-10 ${className}`}
    >
      <div className="flex items-center space-x-4 mb-4">
        {emoji && (
          <motion.span 
            className="text-5xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {emoji}
          </motion.span>
        )}
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#CF50F2] to-[#8552F2] flex items-center justify-center shadow-lg shadow-[#CF50F2]/30">
            <FontAwesomeIcon icon={icon} className="text-white text-2xl" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-3xl md:text-5xl font-poppins font-black text-transparent bg-clip-text bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-[#8552F2] leading-tight">
            {title}
          </h2>
          {/* Línea decorativa */}
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-[#CF50F2] via-[#AC79F2] to-transparent rounded-full mt-2 max-w-xs"
          />
        </div>
      </div>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className={`text-foreground/70 text-lg md:text-xl font-inter ${emoji || icon ? 'ml-20' : ''}`}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  )
}

