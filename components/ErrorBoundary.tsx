'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    
    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // Usar fallback personalizado si se proporciona
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Fallback por defecto
      return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
              Algo salió mal
            </h2>

            {/* Descripción */}
            <p className="text-foreground/70 mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>

            {/* Detalles del error (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-foreground/50 cursor-pointer mb-2 font-mono">
                  Detalles técnicos
                </summary>
                <pre className="text-xs text-error bg-error/5 p-3 rounded-lg overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Recargar página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-card-hover hover:bg-border text-foreground font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Ir al inicio
              </button>
            </div>

            {/* Botón para intentar recuperarse */}
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
            >
              Intentar de nuevo sin recargar
            </button>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

// Hook para errores asíncronos en componentes funcionales
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}

