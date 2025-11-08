import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center">
        {/* Icono 404 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            404
          </h1>
        </motion.div>

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-foreground mb-4"
        >
          Página no encontrada
        </motion.h2>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-foreground/70 mb-8"
        >
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/discover"
            className="bg-card-hover hover:bg-border text-foreground font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Descubrir anime
          </Link>
        </motion.div>

        {/* Ilustración de anime */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-6xl"
        >
          😿
        </motion.div>
      </div>
    </div>
  )
}

