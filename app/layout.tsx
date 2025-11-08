import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import AnimatedBackground from "@/components/AnimatedBackground";
import ErrorBoundary from "@/components/ErrorBoundary";

// Fuente principal moderna para texto
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Fuente para títulos con personalidad
const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

// Fuente monospace moderna
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Animeka - Tu Portal Anime Definitivo",
  description: "Descubre, rastrea y organiza tu colección de anime favorito con Animeka. Miles de animes, gratis y actualizado 24/7.",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AnimatedBackground />
        <Providers>
          <ErrorBoundary>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <footer className="bg-black border-t border-white/5 py-12 mt-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-poppins font-bold text-lg mb-4">
                    <span className="text-primary">Anime</span>
                    <span className="text-secondary">ka</span>
                  </h3>
                  <p className="text-foreground/60 text-sm">
                    Tu plataforma personal para descubrir, trackear y organizar anime.
                  </p>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold mb-4">Enlaces</h4>
                  <ul className="space-y-2 text-sm text-foreground/60">
                    <li><a href="/" className="hover:text-primary transition-colors">Inicio</a></li>
                    <li><a href="/discover" className="hover:text-primary transition-colors">Descubrir</a></li>
                    <li><a href="/search" className="hover:text-primary transition-colors">Buscar</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-poppins font-semibold mb-4">Powered by</h4>
                  <p className="text-sm text-foreground/60">
                    Datos proporcionados por<br />
                    <a href="https://jikan.moe" target="_blank" rel="noopener" className="text-primary hover:underline">
                      Jikan API
                    </a> (MyAnimeList)
                  </p>
                </div>
              </div>
              <div className="border-t border-border pt-8 text-center text-foreground/40 text-sm">
                <p>© 2025 Animeka. Hecho con ❤️ para los fans del anime.</p>
              </div>
            </div>
          </footer>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
