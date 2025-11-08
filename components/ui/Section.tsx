import { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  className?: string
  background?: 'default' | 'card' | 'transparent'
  spacing?: 'sm' | 'md' | 'lg'
}

const backgroundClasses = {
  default: 'bg-transparent',
  card: 'bg-[#382059]/10 backdrop-blur-sm',
  transparent: 'bg-transparent',
}

const spacingClasses = {
  sm: 'py-6 sm:py-8',
  md: 'py-8 sm:py-12',
  lg: 'py-12 sm:py-16',
}

export default function Section({ 
  children, 
  className = '', 
  background = 'default',
  spacing = 'lg'
}: SectionProps) {
  return (
    <section className={`${backgroundClasses[background]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  )
}

