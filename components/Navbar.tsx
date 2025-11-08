'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark, faUser } from '@fortawesome/free-solid-svg-icons'
import Logo from './Logo'
import Image from 'next/image'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userImage, setUserImage] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      // Obtener imagen del usuario
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user?.image) {
            setUserImage(data.user.image)
          }
        })
        .catch(err => console.error('Error fetching user image:', err))
    }
  }, [session])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/discover">Descubrir</NavLink>
            <NavLink href="/search">Buscar</NavLink>
            {session && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/recomendar"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold shadow-lg shadow-[#CF50F2]/30 hover:shadow-[#CF50F2]/50 transition-all"
                >
                  ✨ Recomendar
                </Link>
              </motion.div>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/perfil">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-card/50 hover:bg-card/70 transition-colors cursor-pointer"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#CF50F2] to-[#8552F2] flex-shrink-0">
                      {userImage ? (
                        userImage.startsWith('data:') ? (
                          <img
                            src={userImage}
                            alt={session.user?.name || 'Usuario'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={userImage}
                            alt={session.user?.name || 'Usuario'}
                            fill
                            className="object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-poppins text-foreground/90">
                      {session.user?.name || session.user?.email}
                    </span>
                  </motion.div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signOut()}
                  className="px-5 py-2.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors font-poppins font-medium"
                >
                  Salir
                </motion.button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-lg bg-card hover:bg-card-hover transition-colors font-poppins font-medium"
                  >
                    Iniciar Sesión
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-lg gradient-primary text-white font-poppins font-semibold shadow-lg shadow-primary/30"
                  >
                    Registrarse
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 hover:bg-card rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <FontAwesomeIcon 
              icon={mobileMenuOpen ? faXmark : faBars} 
              className="text-2xl"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 space-y-3"
          >
            <MobileNavLink href="/">Inicio</MobileNavLink>
            <MobileNavLink href="/discover">Descubrir</MobileNavLink>
            <MobileNavLink href="/search">Buscar</MobileNavLink>
            {session && (
              <Link href="/recomendar" className="block">
                <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#CF50F2] to-[#8552F2] text-white font-bold text-center shadow-lg shadow-[#CF50F2]/30">
                  ✨ Recomendar
                </div>
              </Link>
            )}
            <div className="pt-3 border-t border-border">
              {session ? (
                <>
                  <Link href="/perfil" className="block mb-2">
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-card/50 hover:bg-card/70 transition-colors">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#CF50F2] to-[#8552F2] flex-shrink-0">
                        {userImage ? (
                          userImage.startsWith('data:') ? (
                            <img
                              src={userImage}
                              alt={session.user?.name || 'Usuario'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={userImage}
                              alt={session.user?.name || 'Usuario'}
                              fill
                              className="object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FontAwesomeIcon icon={faUser} className="text-white text-sm" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-poppins text-foreground/90">
                        {session.user?.name || session.user?.email}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-3 py-2 rounded-lg bg-error/10 text-error"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/signin" className="block">
                    <button className="w-full px-3 py-2 rounded-lg bg-card-hover">
                      Iniciar Sesión
                    </button>
                  </Link>
                  <Link href="/auth/signup" className="block">
                    <button className="w-full px-3 py-2 rounded-lg gradient-primary text-white">
                      Registrarse
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.span
        whileHover={{ scale: 1.05 }}
        className="text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
      >
        {children}
      </motion.span>
    </Link>
  )
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-3 py-2 rounded-lg hover:bg-card-hover transition-colors">
      {children}
    </Link>
  )
}


