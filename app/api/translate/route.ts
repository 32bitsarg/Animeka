import { NextRequest, NextResponse } from 'next/server'

// Lingva Translate - API open source, gratuita, sin límites
const LINGVA_INSTANCES = [
  'https://lingva.ml/api/v1',
  'https://translate.plausibility.cloud/api/v1',
  'https://lingva.thedaviddelta.com/api/v1'
]

interface LingvaResponse {
  translation: string
}

export async function POST(request: NextRequest) {
  let originalText = ''
  
  try {
    const body = await request.json()
    originalText = body.text

    if (!originalText || originalText.trim() === '') {
      return NextResponse.json({ 
        translatedText: originalText,
        success: true 
      }, { status: 200 })
    }

    // Dividir en chunks si es muy largo (máximo 2000 caracteres por chunk)
    const maxChunkSize = 2000
    let fullTranslation = ''

    if (originalText.length > maxChunkSize) {
      // Dividir por oraciones aproximadamente
      const sentences = originalText.match(/[^.!?]+[.!?]+/g) || [originalText]
      let currentChunk = ''
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
          const translated = await translateChunk(currentChunk)
          fullTranslation += translated + ' '
          currentChunk = sentence
        } else {
          currentChunk += sentence
        }
      }
      
      if (currentChunk) {
        const translated = await translateChunk(currentChunk)
        fullTranslation += translated
      }
    } else {
      fullTranslation = await translateChunk(originalText)
    }
    
    console.log('✅ Translation successful')
    
    return NextResponse.json({ 
      translatedText: fullTranslation.trim(),
      success: true 
    })
  } catch (error) {
    console.error('❌ Translation error:', error)
    
    // Si falla, devolver el texto original
    return NextResponse.json({ 
      translatedText: originalText,
      success: false,
      error: 'Translation failed, returning original text'
    }, { status: 200 })
  }
}

async function translateChunk(text: string): Promise<string> {
  // Intentar con cada instancia hasta que una funcione
  for (const instance of LINGVA_INSTANCES) {
    try {
      const encodedText = encodeURIComponent(text)
      const url = `${instance}/en/es/${encodedText}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (response.ok) {
        const data: LingvaResponse = await response.json()
        return data.translation
      }
    } catch (error) {
      console.warn(`Failed with instance ${instance}, trying next...`)
      continue
    }
  }
  
  // Si todas fallan, retornar el texto original
  console.warn('All translation instances failed, returning original text')
  return text
}

