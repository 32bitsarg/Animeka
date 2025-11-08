'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icons, type IconName } from '@/lib/icons'
import { type SizeProp } from '@fortawesome/fontawesome-svg-core'

interface IconProps {
  name: IconName
  size?: SizeProp
  className?: string
  spin?: boolean
}

/**
 * Componente centralizado de iconos con tree-shaking automático
 * Solo los iconos importados en lib/icons.ts serán incluidos en el bundle
 */
export default function Icon({ name, size, className, spin }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icons[name]}
      size={size}
      className={className}
      spin={spin}
    />
  )
}
