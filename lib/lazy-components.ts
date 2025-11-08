/**
 * Centralización de componentes con lazy loading
 * Optimiza el bundle inicial cargando componentes solo cuando se necesitan
 */

import { lazy } from 'react'

// Componentes pesados que se usan condicionalmente
export const RecommendationModal = lazy(() => 
  import('@/app/recomendar/page').then(m => ({
    default: m.CreateRecommendationModal || (() => null)
  }))
)

// Si tienes modales o componentes que solo se muestran al hacer clic
export const SearchModal = lazy(() => 
  import('@/components/SearchBar')
)

// Barra de búsqueda con lazy loading
export const LazySearchBar = lazy(() => 
  import('@/components/SearchBar')
)

// Página de perfil (si es muy pesada)
export const ProfilePage = lazy(() => 
  import('@/app/perfil/page')
)

// Componente de recomendaciones (feed pesado)
export const RecommendationsPage = lazy(() => 
  import('@/app/recomendar/page')
)

// Detalles de anime (con mucha información)
export const AnimeDetails = lazy(() => 
  import('@/app/anime/[id]/page')
)

/**
 * Pre-cargar componentes que probablemente se usen pronto
 */
export function preloadComponent(componentName: keyof typeof lazyComponents) {
  const component = lazyComponents[componentName]
  if (component) {
    // @ts-ignore - preload no está tipado
    component.preload?.()
  }
}

const lazyComponents = {
  RecommendationModal,
  SearchModal,
  ProfilePage,
  RecommendationsPage,
  AnimeDetails,
}

export default lazyComponents

