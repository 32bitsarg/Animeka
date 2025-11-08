'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error en la aplicación:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-card-bg border border-border rounded-2xl p-8 text-center"
      >
        {/* Icono de error */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-error/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          ¡Ups! Algo salió mal
        </h2>

        {/* Descripción */}
        <p className="text-foreground/70 mb-6">
          Ha ocurrido un error inesperado. No te preocupes, estamos trabajando en ello.
        </p>

        {/* Detalles del error (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="text-sm text-foreground/50 cursor-pointer mb-2 font-mono">
              Detalles técnicos
            </summary>
            <pre className="text-xs text-error bg-error/5 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {error.message}
              {error.digest && `\n\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-card-hover hover:bg-border text-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </motion.div>
    </div>
  )
}

