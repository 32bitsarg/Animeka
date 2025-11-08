import { ReactNode } from 'react'

interface AnimeGridProps {
  children: ReactNode
  variant?: 'default' | 'compact' | 'wide'
  className?: string
}

const gridClasses = {
  default: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6',
  compact: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4',
  wide: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
}

export default function AnimeGrid({ 
  children, 
  variant = 'default', 
  className = '' 
}: AnimeGridProps) {
  return (
    <div className={`${gridClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}

