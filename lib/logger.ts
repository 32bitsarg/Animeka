// Sistema de logging centralizado para producción y desarrollo

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    }
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry = this.formatMessage(level, message, data)

    if (this.isDevelopment) {
      // En desarrollo: logs coloridos en consola
      const colors: Record<LogLevel, string> = {
        info: '\x1b[36m',    // Cyan
        warn: '\x1b[33m',    // Yellow
        error: '\x1b[31m',   // Red
        debug: '\x1b[35m',   // Magenta
      }
      const reset = '\x1b[0m'
      const color = colors[level]

      console.log(
        `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        data ? data : ''
      )
    } else {
      // En producción: JSON estructurado
      console.log(JSON.stringify(entry))

      // Aquí podrías enviar a servicios externos:
      // - Sentry para errores
      // - CloudWatch para AWS
      // - Datadog, LogRocket, etc.
      
      if (level === 'error') {
        // Ejemplo: Sentry.captureException(data)
      }
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, error)
  }

  debug(message: string, data?: any) {
    if (this.isDevelopment) {
      this.log('debug', message, data)
    }
  }

  // Método para medir performance
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start
      this.debug(`${label} completado en ${duration.toFixed(2)}ms`)
      return result
    } catch (error) {
      const duration = performance.now() - start
      this.error(`${label} falló después de ${duration.toFixed(2)}ms`, error)
      throw error
    }
  }
}

// Instancia global del logger
export const logger = new Logger()

// Helper para errores de API
export function logApiError(endpoint: string, error: any, context?: any) {
  logger.error(`API Error en ${endpoint}`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    context,
  })
}

// Helper para performance de queries
export async function logQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  return logger.measure(`Query: ${queryName}`, queryFn)
}

