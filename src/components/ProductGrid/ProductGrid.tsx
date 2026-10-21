'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard/ProductCard'
import { categories } from '@/data/categories'
import type { Product } from '@/types'
import { cn } from '@/utils/cn'

interface ProductGridProps {
  products: Product[]
  showFilters?: boolean
  title?: string
  className?: string
  initialCategory?: string
}

export default function ProductGrid({
  products,
  showFilters = false,
  title,
  className,
  initialCategory,
}: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory && categories.some((c) => c.id === initialCategory) ? initialCategory : 'all'
  )

  const filtersRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ left: false, right: false })

  // Muestra cada flecha solo si queda contenido escondido de ese lado.
  const updateArrows = useCallback(() => {
    const el = filtersRef.current
    if (!el) return
    setCanScroll({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    })
  }, [])

  useEffect(() => {
    const el = filtersRef.current
    if (!el) return
    const observer = new ResizeObserver(updateArrows)
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateArrows])

  const scrollFilters = (dir: -1 | 1) => {
    const el = filtersRef.current
    el?.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory)

  return (
    <section className={cn('py-12 px-4', className)}>
      {title && (
        <div className="max-w-screen-xl mx-auto mb-10">
          <h2 className="text-white text-2xl sm:text-4xl font-black tracking-tight uppercase">
            {title}
          </h2>
        </div>
      )}

      {/* Category filters */}
      {showFilters && (
        <div className="relative max-w-screen-xl mx-auto mb-8">
          {canScroll.left && (
            <button
              type="button"
              onClick={() => scrollFilters(-1)}
              aria-label="Ver filtros anteriores"
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-[12px_0_16px_8px_rgb(9_9_11)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {canScroll.right && (
            <button
              type="button"
              onClick={() => scrollFilters(1)}
              aria-label="Ver más filtros"
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 shadow-[-12px_0_16px_8px_rgb(9_9_11)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <ChevronRight size={18} />
            </button>
          )}
          <div
            ref={filtersRef}
            onScroll={updateArrows}
            className="no-scrollbar overflow-x-auto"
          >
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'py-2 px-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap',
                activeCategory === 'all'
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700'
              )}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'py-2 px-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-[var(--accent)] text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* Editorial grid — alternating large/small */}
      {filtered.length === 0 ? (
        <div className="max-w-screen-xl mx-auto text-center py-20">
          <p className="text-zinc-500 text-lg">No hay productos para esta selección.</p>
        </div>
      ) : (
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              size={i % 5 === 0 ? 'large' : 'default'}
            />
          ))}
        </div>
      )}
    </section>
  )
}
