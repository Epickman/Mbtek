'use client'

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, LayoutGrid, List, Menu, Check, ShieldCheck } from 'lucide-react'
import ProductCard from '@/components/ProductCard/ProductCard'
import ProductActions from '@/components/ProductCard/ProductActions'
import { formatPrice } from '@/utils/formatPrice'
import { categories } from '@/data/categories'
import type { Product } from '@/types'
import { cn } from '@/utils/cn'
import siteConfig from '@/config/site'
import Reveal from '@/components/ui/Reveal'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────


interface Filters {
  search: string
  category: string
  sort: '' | 'price-asc' | 'price-desc'
  inStock: boolean
}

const ORIGINALS_WA_URL = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
  `Hola ${siteConfig.whatsappName}! Estoy buscando una pieza original para mi vehículo: `
)}`

const emptyFilters: Filters = { search: '', category: '', sort: '', inStock: false }

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

export default function TiendaClient({
  products, initialCategory,
}: { products: Product[]; initialCategory?: string }) {
  return (
    <div className="min-h-screen bg-zinc-950">

      {/* ── HERO / INTRO ─────────────────────────────────────────────────────── */}
      {/* Pantalla completa: la foto queda detrás del header, como en el inicio y Nosotros */}
      <div className="relative overflow-hidden bg-zinc-950 flex items-end min-h-[100svh] pt-[112px]">
        {/* Background banner */}
        <Image
          src="/images/bannertienda-sinlogo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center] lg:object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-zinc-950/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-transparent via-60% to-zinc-950" />
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(220,38,38,0.07) 0%, transparent 65%)',
          }}
        />
        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-10 lg:pb-16">
          <div className="flex">
            <div className="text-left">
              <h1>
                <span className="block text-white font-black uppercase leading-[0.9] tracking-tight mb-4" style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}>
                  Tienda
                </span>
                <span className="sr-only">MBTEK Parts ATV &amp; MX</span>
                <Image
                  src="/brand/mbtek-logo.png"
                  alt=""
                  width={1677}
                  height={405}
                  priority
                  className="h-auto w-[min(85vw,560px)] drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
                />
              </h1>
              <p className="text-zinc-500 text-sm mt-3 max-w-sm leading-relaxed">
                Repuestos premium para ATV y MX. Buscá por nombre o SKU y armá tu pedido.
              </p>
            </div>
          </div>
        </div>
      </div>

      <CatalogoTab products={products} initialCategory={initialCategory} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CATÁLOGO
// ─────────────────────────────────────────────────────────────────────────────

function CatalogoTab({
  products, initialCategory,
}: { products: Product[]; initialCategory?: string }) {
  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    category: initialCategory && categories.some(c => c.id === initialCategory) ? initialCategory : '',
  })
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const update = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) =>
    setFilters(f => ({ ...f, [k]: v })), [])

  const clear = useCallback(() => setFilters(emptyFilters), [])

  const activeCount = (filters.category ? 1 : 0) + (filters.search ? 1 : 0) + (filters.inStock ? 1 : 0)

  const filtered = useMemo(() => {
    let r = [...products]
    if (filters.search) {
      const q = filters.search.toLowerCase()
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    }
    if (filters.category) r = r.filter(p => p.category === filters.category)
    if (filters.inStock) r = r.filter(p => (p.stock ?? 0) > 0)
    // Los productos "a consultar" van siempre al final
    const priceOf = (p: Product, missing: number) => p.price ?? missing
    if (filters.sort === 'price-asc') r.sort((a, b) => priceOf(a, Infinity) - priceOf(b, Infinity))
    if (filters.sort === 'price-desc') r.sort((a, b) => priceOf(b, -Infinity) - priceOf(a, -Infinity))
    return r
  }, [products, filters])

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900/20 to-zinc-950">
      <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-8">
      {/* Toolbar */}
      <div className="flex flex-row gap-2 sm:gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="search"
            value={filters.search}
            onChange={e => update('search', e.target.value)}
            placeholder="Buscar producto, SKU..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          {filters.search && (
            <button onClick={() => update('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
              <X size={13} />
            </button>
          )}
        </div>

        <FilterMenu products={products} filters={filters} update={update} />

        {/* View toggle */}
        <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-700 rounded-xl p-1">
          <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-all', view === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300')} aria-pressed={view === 'grid'}><LayoutGrid size={15} /></button>
          <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-all', view === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300')} aria-pressed={view === 'list'}><List size={15} /></button>
        </div>
      </div>

      {/* Active chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.category && (
            <Chip label={categories.find(c => c.id === filters.category)?.name ?? filters.category} onRemove={() => update('category', '')} />
          )}
          {filters.search && <Chip label={`"${filters.search}"`} onRemove={() => update('search', '')} />}
          {filters.inStock && <Chip label="Con stock" onRemove={() => update('inStock', false)} />}
          <button onClick={clear} className="text-zinc-500 hover:text-zinc-300 text-xs underline underline-offset-2 transition-colors self-center">Limpiar</button>
        </div>
      )}

      {/* Results */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-zinc-500 text-sm">
          <span className="text-white font-semibold">{filtered.length}</span> producto{filtered.length !== 1 ? 's' : ''}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-zinc-500">
          <ShieldCheck size={13} className="flex-shrink-0" />
          Conseguimos piezas originales.
          <a href={ORIGINALS_WA_URL} target="_blank" rel="noopener noreferrer" className="text-zinc-400 underline underline-offset-2 hover:text-white">
            Pedila por WhatsApp
          </a>
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 mb-4">Sin resultados para esa búsqueda.</p>
          <button onClick={clear} className="py-2.5 px-6 bg-[var(--accent)] text-black font-bold text-sm rounded-full">Limpiar filtros</button>
        </div>
      ) : view === 'grid' ? (
        <ProductGrid products={filtered} />
      ) : (
        <ProductList products={filtered} />
      )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Menú de filtros (categoría, stock y orden)
// ─────────────────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: Filters['sort']; label: string }[] = [
  { value: '', label: 'Sin ordenar' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
]

function FilterMenu({
  products, filters, update,
}: {
  products: Product[]
  filters: Filters
  update: <K extends keyof Filters>(k: K, v: Filters[K]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Se cierra al tocar afuera o con Escape
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Solo las categorías que tienen productos, con la cantidad
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1)
    return m
  }, [products])
  const used = categories.filter(c => counts.has(c.id))
  const active = (filters.category ? 1 : 0) + (filters.sort ? 1 : 0) + (filters.inStock ? 1 : 0)

  const option = (selected: boolean) =>
    cn(
      'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
      selected ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
    )

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'flex h-full items-center gap-2 rounded-xl border bg-zinc-900 px-3 sm:px-4 text-sm transition-colors',
          open || active ? 'border-zinc-500 text-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
        )}
      >
        <Menu size={16} />
        <span className="hidden sm:inline">Filtros</span>
        {active > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[0.6875rem] font-bold text-white">
            {active}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 max-h-[70vh] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-zinc-700 bg-zinc-900 p-3 shadow-2xl shadow-black/60">
          <p className="px-3 pb-1.5 pt-1 text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">Categoría</p>
          <button onClick={() => update('category', '')} className={option(!filters.category)}>
            Todas <span className="text-xs text-zinc-500">{products.length}</span>
          </button>
          {used.map(c => (
            <button key={c.id} onClick={() => update('category', c.id)} className={option(filters.category === c.id)}>
              {c.name} <span className="text-xs text-zinc-500">{counts.get(c.id)}</span>
            </button>
          ))}

          <div className="my-3 border-t border-zinc-800" />

          <button onClick={() => update('inStock', !filters.inStock)} className={option(filters.inStock)} role="switch" aria-checked={filters.inStock}>
            Solo con stock
            <span className={cn('flex h-4 w-4 items-center justify-center rounded border', filters.inStock ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-zinc-600')}>
              {filters.inStock && <Check size={11} className="text-white" />}
            </span>
          </button>

          <div className="my-3 border-t border-zinc-800" />

          <p className="px-3 pb-1.5 text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">Ordenar por precio</p>
          {SORT_OPTIONS.map(o => (
            <button key={o.value} onClick={() => update('sort', o.value)} className={option(filters.sort === o.value)}>
              {o.label}
              {filters.sort === o.value && <Check size={14} className="text-[var(--accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Grid / List
// ─────────────────────────────────────────────────────────────────────────────

// Mismas tarjetas que "Más vendidos" en el inicio
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, i) => (
        <Reveal key={product.id} delay={(i % 3) * 0.08} className="[&>*]:h-full">
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  )
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="space-y-3">
      {products.map(product => {
        return (
          <Reveal key={product.id}>
          <article className="flex gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all group">
            <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs text-zinc-500 font-mono">{product.sku}</span>
                    <Link href={`/productos/${product.slug}`}>
                      <h3 className="text-white font-semibold text-lg hover:text-[var(--accent)] transition-colors">{product.name}</h3>
                    </Link>
                  </div>
                  <span className="text-white font-bold text-xl whitespace-nowrap flex-shrink-0">{formatPrice(product.price)}</span>
                </div>
                <p className="text-zinc-500 text-sm mt-1 line-clamp-2">{product.description}</p>
              </div>
              <ProductActions product={product} variant="list" className="mt-3" />
            </div>
          </article>
          </Reveal>
        )
      })}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-300">
      {label}
      <button onClick={onRemove} className="text-zinc-500 hover:text-white transition-colors"><X size={10} /></button>
    </span>
  )
}
