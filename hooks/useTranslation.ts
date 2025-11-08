import { useState, useEffect } from 'react'
import { translateToSpanish } from '@/lib/services/translator'

/**
 * Hook personalizado para traducir texto de forma reactiva
 */
export function useTranslation(text: string | undefined, enabled: boolean = true) {
  const [translated, setTranslated] = useState<string>(text || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!text || !enabled) {
      setTranslated(text || '')
      return
    }

    let isMounted = true
    setLoading(true)

    translateToSpanish(text)
      .then(result => {
        if (isMounted) {
          setTranslated(result)
          setLoading(false)
        }
      })
      .catch(error => {
        console.error('Translation error:', error)
        if (isMounted) {
          setTranslated(text) // Fallback al texto original
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [text, enabled])

  return { translated, loading }
}

