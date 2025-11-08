// Servicio de traducción usando nuestra propia API
import { apiCache } from '../utils/cache'

const TRANSLATION_CACHE_TTL = 30 * 24 * 60 * 60 * 1000 // 30 días

interface TranslationResponse {
  translatedText: string
  success: boolean
}

/**
 * Traduce texto de inglés a español usando nuestra API interna
 * Con sistema de caché para evitar traducciones repetidas
 */
export async function translateToSpanish(text: string): Promise<string> {
  if (!text || text.trim() === '') return text

  // Verificar caché
  const cacheKey = `translation_${text.substring(0, 100)}` // Usar los primeros 100 caracteres como key
  const cached = apiCache.get<string>(cacheKey)
  if (cached) {
    console.log('✅ Translation from cache')
    return cached
  }

  try {
    console.log('🔄 Translating text...')
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      console.warn('Translation API error, returning original text')
      return text
    }

    const data: TranslationResponse = await response.json()
    const translated = data.translatedText || text

    // Guardar en caché por 30 días
    apiCache.set(cacheKey, translated, TRANSLATION_CACHE_TTL)
    console.log('✨ Translation completed and cached')

    return translated
  } catch (error) {
    console.error('❌ Error translating text:', error)
    // Si falla, retornar el texto original
    return text
  }
}

/**
 * Traduce un array de textos de forma eficiente
 */
export async function translateBatch(texts: string[]): Promise<string[]> {
  const promises = texts.map(text => translateToSpanish(text))
  return Promise.all(promises)
}

/**
 * Traduce solo si el texto está en inglés (detección simple)
 */
export async function translateIfNeeded(text: string): Promise<string> {
  if (!text) return text
  
  // Detección simple: si tiene muchas palabras comunes en inglés
  const englishWords = ['the', 'and', 'is', 'in', 'at', 'of', 'to', 'a']
  const lowerText = text.toLowerCase()
  const hasEnglish = englishWords.some(word => lowerText.includes(` ${word} `))
  
  if (hasEnglish) {
    return translateToSpanish(text)
  }
  
  return text
}

