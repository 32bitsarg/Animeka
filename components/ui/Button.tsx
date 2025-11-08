'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const variantClasses = {
  primary: 'bg-[#CF50F2] text-white hover:bg-[#CF50F2]/90 hover:shadow-lg hover:shadow-[#CF50F2]/50',
  secondary: 'bg-[#382059] text-white hover:bg-[#382059]/90 hover:shadow-lg hover:shadow-[#382059]/50',
  outline: 'border-2 border-[#CF50F2] text-[#CF50F2] hover:bg-[#CF50F2] hover:text-white',
  ghost: 'text-foreground hover:bg-card-hover',
  danger: 'bg-error/10 text-error hover:bg-error/20',
}

const sizeClasses = {
  sm: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm',
  md: 'px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base',
  lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg',
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        rounded-lg font-medium
        transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}

