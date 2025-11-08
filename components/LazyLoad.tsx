'use client'

import { Suspense, lazy, ComponentType } from 'react'

interface LazyLoadProps {
  fallback?: React.ReactNode
}

/**
 * Wrapper para Suspense con fallback por defecto
 */
export function LazyLoad({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

/**
 * HOC para lazy loading de componentes
 */
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyComponent(props: P) {
    return (
      <LazyLoad fallback={fallback}>
        <Component {...props} />
      </LazyLoad>
    )
  }
}

// Fallbacks predefinidos para diferentes situaciones
export const fallbacks = {
  card: (
    <div className="animate-pulse bg-card-bg rounded-2xl h-96 w-full" />
  ),
  
  list: (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse bg-card-bg rounded-xl h-24 w-full" />
      ))}
    </div>
  ),
  
  modal: (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-2xl p-8">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    </div>
  ),
  
  page: (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-foreground/70">Cargando...</p>
      </div>
    </div>
  ),
}

