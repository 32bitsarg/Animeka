import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Headers de seguridad robustos
  
  // 🔒 Content Security Policy - Protección contra XSS
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requiere unsafe-inline para HMR
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https:",
      "connect-src 'self' https://api.jikan.moe https://lingva.ml https://translate.plausibility.cloud https://*.hstgr.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // 🔒 X-Frame-Options - Protección contra clickjacking
  response.headers.set('X-Frame-Options', 'DENY')

  // 🔒 X-Content-Type-Options - Prevenir MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  // 🔒 Referrer-Policy - Control de información de referencia
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // 🔒 X-XSS-Protection - Protección XSS legacy (algunos navegadores antiguos)
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // 🔒 Permissions-Policy - Deshabilitar APIs peligrosas
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Anti-FLoC
    ].join(', ')
  )

  // 🔒 Strict-Transport-Security - Forzar HTTPS (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

// Configurar paths donde aplicar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

