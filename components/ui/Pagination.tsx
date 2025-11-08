'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxVisible?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisible = 7,
}: PaginationProps) {
  // Calcular páginas visibles
  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = []
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica compleja para muchas páginas
      const leftSiblings = Math.floor((maxVisible - 3) / 2)
      const rightSiblings = Math.ceil((maxVisible - 3) / 2)
      
      const showLeftDots = currentPage > leftSiblings + 2
      const showRightDots = currentPage < totalPages - rightSiblings - 1
      
      if (!showLeftDots && showRightDots) {
        // Inicio: 1 2 3 4 5 ... 20
        for (let i = 1; i <= maxVisible - 2; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (showLeftDots && !showRightDots) {
        // Final: 1 ... 16 17 18 19 20
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - (maxVisible - 3); i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Medio: 1 ... 8 9 10 ... 20
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - leftSiblings; i <= currentPage + rightSiblings; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }, [currentPage, totalPages, maxVisible])

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Botón primera página */}
      {showFirstLast && currentPage > 1 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(1)}
          className="px-3 py-2 rounded-lg bg-card-hover hover:bg-border text-foreground font-medium transition-colors"
        >
          ««
        </motion.button>
      )}

      {/* Botón anterior */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === 1
            ? 'bg-card-bg text-foreground/30 cursor-not-allowed'
            : 'bg-card-hover hover:bg-border text-foreground'
        }`}
      >
        ‹ Anterior
      </motion.button>

      {/* Números de página */}
      {visiblePages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className="px-2 text-foreground/50">
              ...
            </span>
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <motion.button
            key={pageNum}
            whileHover={!isActive ? { scale: 1.05 } : {}}
            whileTap={!isActive ? { scale: 0.95 } : {}}
            onClick={() => onPageChange(pageNum)}
            className={`min-w-[40px] h-10 rounded-lg font-semibold transition-all ${
              isActive
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                : 'bg-card-hover hover:bg-border text-foreground'
            }`}
          >
            {pageNum}
          </motion.button>
        )
      })}

      {/* Botón siguiente */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentPage === totalPages
            ? 'bg-card-bg text-foreground/30 cursor-not-allowed'
            : 'bg-card-hover hover:bg-border text-foreground'
        }`}
      >
        Siguiente ›
      </motion.button>

      {/* Botón última página */}
      {showFirstLast && currentPage < totalPages && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-2 rounded-lg bg-card-hover hover:bg-border text-foreground font-medium transition-colors"
        >
          »»
        </motion.button>
      )}
    </div>
  )
}

// Hook personalizado para manejo de paginación
export function usePagination(totalItems: number, itemsPerPage: number = 20) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  return {
    totalPages,
    itemsPerPage,
  }
}

