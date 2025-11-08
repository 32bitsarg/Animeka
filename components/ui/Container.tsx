import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
}

export default function Container({ children, className = '', size = 'xl' }: ContainerProps) {
  return (
    <div className={`container mx-auto px-3 sm:px-4 md:px-6 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  )
}

