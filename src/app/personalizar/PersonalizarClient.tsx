'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import VehicleDiagram from '@/components/VehicleDiagram/VehicleDiagram'
import { useCart } from '@/store/cartStore'
import { useProducts } from '@/store/productsContext'
import { categories } from '@/data/categories'

// Partes que se pueden personalizar, cada una con las categorías de productos que agrupa
const PART_GROUPS: Record<string, string[]> = {
  ruedas: ['ruedas', 'neumaticos', 'frenos', 'suspension'],
  motor: ['motor', 'admision', 'embrague', 'transmision'],
  escape: ['escape'],
}
const parts = categories.filter((c) => c.id in PART_GROUPS)
/** Parte del vehículo a la que pertenece una categoría de producto (o undefined si no se personaliza) */
const partOf = (category: string) =>
  Object.keys(PART_GROUPS).find((part) => PART_GROUPS[part].includes(category))
import { productFitsVehicleType } from '@/data/vehicleBrands'
import { vehicleDiagrams, type DiagramType } from '@/data/vehicleDiagrams'
import type { CartItem, Product } from '@/types'
import { formatPrice, formatStock } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

export default function PersonalizarClient({ type }: { type: DiagramType | null }) {
  if (!type) return <VehicleChooser />
  return <Customizer type={type} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Paso inicial: elegir qué personalizar
// ─────────────────────────────────────────────────────────────────────────────

function VehicleChooser() {
  const catalog = useProducts()

  return (
    <div className="min-h-screen bg-zinc-950 pt-[120px] pb-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[0.625rem] font-medium uppercase tracking-[0.35em] text-zinc-500">MBTEK Parts</p>
          <h1
            className="font-black uppercase leading-[0.9] tracking-tight text-white"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
          >
            ¿Qué querés <span className="text-[var(--accent)]">personalizar</span>?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
            Elegí tu vehículo y tocá cada parte para ver qué componente tenés en el carrito.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Object.values(vehicleDiagrams).map((d) => {
            const available = catalog.filter(
              (p) => partOf(p.category) && productFitsVehicleType(p, d.type)
            ).length
            return (
              <Link
                key={d.type}
                href={`/personalizar?tipo=${d.type}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] sm:p-8"
              >
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={d.img.src}
                    alt={`Ilustración de ${d.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tight text-white">{d.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">{d.description}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {available > 0
                        ? `${available} producto${available !== 1 ? 's' : ''} compatible${available !== 1 ? 's' : ''}`
                        : 'Próximamente más productos'}
                    </p>
                  </div>
                  <span className="flex flex-shrink-0 items-center gap-2 rounded-sm bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[1.5px] text-white transition-colors group-hover:bg-[var(--accent-hover)]">
                    Personalizar <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Personalizador del vehículo elegido
// ─────────────────────────────────────────────────────────────────────────────

function Customizer({ type }: { type: DiagramType }) {
  const diagram = vehicleDiagrams[type]
  const catalog = useProducts()
  const { state, addItem, removeItem, updateQty, totalItems, openCart } = useCart()
  const [active, setActive] = useState<string | null>(null)

  const fits = (p: Product) => productFitsVehicleType(p, type)
  // Sólo cuentan los productos del carrito que le sirven a este vehículo
  const cartItems = state.items.filter((i) => fits(i.product))

  // Unidades en el carrito por categoría (= parte del vehículo)
  const cartCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of state.items) {
      const part = partOf(item.product.category)
      if (!part || !productFitsVehicleType(item.product, type)) continue
      counts[part] = (counts[part] ?? 0) + item.quantity
    }
    return counts
  }, [state.items, type])

  const coveredParts = parts.filter((c) => cartCounts[c.id]).length
  const activeCategory = parts.find((c) => c.id === active) ?? null
  const inCart = cartItems.filter((i) => partOf(i.product.category) === active)
  const options = catalog.filter((p) => partOf(p.category) === active && fits(p))

  return (
    <div className="min-h-screen bg-zinc-950 pt-[120px] pb-20">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              href="/personalizar"
              className="mb-3 inline-flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-[0.3em] text-zinc-500 transition-colors hover:text-white"
            >
              <ArrowLeft size={12} /> Cambiar vehículo
            </Link>
            <h1
              className="font-black uppercase leading-[0.9] tracking-tight text-white"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
            >
              Personalizá tu <span className="text-[var(--accent)]">{diagram.name}</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
              Tocá cada parte para ver qué componente tenés en el carrito y sumar los que te faltan.
            </p>
            {/* ATV / MX switch */}
            <div className="mt-5 inline-flex rounded-full border border-zinc-800 bg-zinc-900 p-1" role="tablist" aria-label="Vehículo">
              {Object.values(vehicleDiagrams).map((d) => (
                <Link
                  key={d.type}
                  href={`/personalizar?tipo=${d.type}`}
                  role="tab"
                  aria-selected={d.type === type}
                  className={cn(
                    'rounded-full px-5 py-1.5 text-xs font-bold uppercase tracking-[1.5px] transition-colors',
                    d.type === type ? 'bg-[var(--accent)] text-white' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
            <div>
              <p className="text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">Partes cubiertas</p>
              <p className="text-lg font-black text-white">
                {coveredParts}
                <span className="text-zinc-500"> / {parts.length}</span>
              </p>
            </div>
            <button
              onClick={openCart}
              className="flex items-center gap-2 rounded-sm bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              <ShoppingCart size={15} />
              Ver carrito ({totalItems})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* ── Diagram ─────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 sm:p-6 lg:sticky lg:top-[120px] lg:self-start">
            <VehicleDiagram
              diagram={diagram}
              categories={parts}
              activeCategory={active}
              onCategorySelect={setActive}
              cartCounts={cartCounts}
            />

            {/* Parts as chips — same info as the diagram, easier on small screens */}
            <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label={`Partes del ${diagram.name}`}>
              {parts.map((cat) => {
                const count = cartCounts[cat.id] ?? 0
                return (
                  <li key={cat.id}>
                  <button
                    onClick={() => setActive(cat.id)}
                    aria-pressed={active === cat.id}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      active === cat.id
                        ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-white'
                        : count > 0
                          ? 'border-green-500/50 bg-green-500/10 text-green-300 hover:border-green-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                    )}
                  >
                    {count > 0 && <Check size={12} />}
                    {cat.name}
                    {count > 0 && <span className="text-[0.625rem] opacity-80">×{count}</span>}
                  </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* ── Part panel ──────────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
            {!activeCategory ? (
              <PartsSummary
                name={diagram.name}
                cartItems={cartItems}
                onSelect={setActive}
              />
            ) : (
              <div className="animate-fade-in" key={activeCategory.id}>
                <button
                  onClick={() => setActive(null)}
                  className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
                >
                  <ArrowLeft size={13} /> Ver resumen de tu {diagram.name}
                </button>
                <p className="text-[0.625rem] uppercase tracking-[0.25em] text-zinc-500">Parte seleccionada</p>
                <h2 className="mt-1 text-2xl font-black uppercase tracking-tight text-white">
                  {activeCategory.name}
                </h2>

                {/* In cart */}
                <section className="mt-5" aria-labelledby="en-carrito">
                  <h3 id="en-carrito" className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    En tu carrito
                  </h3>
                  {inCart.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-4 text-sm text-zinc-500">
                      No tenés ningún componente de {activeCategory.name.toLowerCase()} en el carrito.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {inCart.map((item) => (
                        <li
                          key={item.product.id}
                          className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 p-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/productos/${item.product.slug}`}
                              className="line-clamp-2 text-sm font-semibold leading-tight text-white hover:text-[var(--accent)]"
                            >
                              {item.product.name}
                            </Link>
                            <p className="mt-0.5 text-xs text-zinc-400">{formatPrice(item.product.price)}</p>
                          </div>
                          <div className="flex items-center rounded-full border border-zinc-700">
                            <button
                              onClick={() =>
                                item.quantity > 1
                                  ? updateQty(item.product.id, item.quantity - 1)
                                  : removeItem(item.product.id)
                              }
                              className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-white"
                              aria-label={`Reducir cantidad de ${item.product.name}`}
                            >
                              {item.quantity > 1 ? <Minus size={12} /> : <Trash2 size={12} />}
                            </button>
                            <span className="w-5 text-center text-sm text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQty(item.product.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center text-zinc-400 hover:text-white"
                              aria-label={`Aumentar cantidad de ${item.product.name}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Options */}
                <section className="mt-7" aria-labelledby="opciones">
                  <h3 id="opciones" className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400">
                    Opciones para esta parte
                  </h3>
                  {options.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Todavía no tenemos productos de {activeCategory.name.toLowerCase()} para {diagram.name}.{' '}
                      <Link href="/contacto" className="text-[var(--accent)] hover:underline">Consultanos</Link>.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {options.map((product) => {
                        const added = state.items.some((i) => i.product.id === product.id)
                        return (
                          <li
                            key={product.id}
                            className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[0.625rem] uppercase tracking-[0.15em] text-zinc-500">
                                {categories.find((c) => c.id === product.category)?.name ?? product.category}
                              </p>
                              <Link
                                href={`/productos/${product.slug}`}
                                className="line-clamp-2 text-sm font-semibold leading-tight text-white hover:text-[var(--accent)]"
                              >
                                {product.name}
                              </Link>
                              <p className="mt-0.5 text-xs text-zinc-400">
                                {formatPrice(product.price)}
                                {product.stock !== undefined && (
                                  <span className={cn('ml-2', product.stock === 0 ? 'text-red-400' : 'text-zinc-500')}>
                                    {formatStock(product.stock)}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (!added) addItem(product)
                              }}
                              disabled={added || product.stock === 0}
                              className={cn(
                                'flex flex-shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold uppercase transition-colors',
                                added
                                  ? 'cursor-default border-green-500/40 bg-green-500/10 text-green-300'
                                  : product.stock === 0
                                  ? 'cursor-not-allowed border-zinc-800 bg-zinc-900 text-zinc-600'
                                  : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-[var(--accent)] hover:text-white'
                              )}
                              aria-label={added ? `${product.name} ya está en el carrito` : `Agregar ${product.name}`}
                            >
                              {added ? <Check size={12} /> : <Plus size={12} />}
                              {added ? 'Agregado' : 'Agregar'}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Panel inicial: arriba lo que ya tiene puesto el vehículo, abajo las que se pueden agregar */
function PartsSummary({
  name,
  cartItems,
  onSelect,
}: {
  name: string
  cartItems: CartItem[]
  onSelect: (id: string) => void
}) {
  const { removeItem } = useCart()
  // Las partes en el orden del catálogo, cada una con sus productos del carrito
  const installed = parts
    .map((cat) => ({ cat, items: cartItems.filter((i) => partOf(i.product.category) === cat.id) }))
    .filter((p) => p.items.length > 0)
  const missing = parts.filter((cat) => !cartItems.some((i) => partOf(i.product.category) === cat.id))

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-tight text-white">Tu {name}</h2>
      <p className="mt-1 text-sm text-zinc-400">Tocá una parte para cambiarla o sumarle un componente.</p>

      {/* Lo que ya tiene puesto */}
      <section className="mt-6" aria-labelledby="puesto">
        <h3
          id="puesto"
          className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.15em] text-green-400"
        >
          <span className="flex items-center gap-1.5">
            <Check size={13} /> Ya tenés puesto
          </span>
          <span className="text-zinc-500">{installed.length}</span>
        </h3>
        {installed.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-4 text-sm text-zinc-500">
            Todavía no agregaste nada. Empezá por alguna parte de la lista de abajo.
          </p>
        ) : (
          <ul className="space-y-2">
            {installed.map(({ cat, items }) => (
              <li key={cat.id} className="rounded-xl border border-green-500/30 bg-green-500/5 p-2.5">
                <button
                  onClick={() => onSelect(cat.id)}
                  className="mb-1.5 flex w-full items-center justify-between px-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white"
                >
                  {cat.name}
                  <span className="normal-case tracking-normal text-zinc-500">Cambiar →</span>
                </button>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item.product.id} className="flex items-center gap-3">
                      <p className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-tight text-white">
                        {item.product.name}
                      </p>
                      {item.quantity > 1 && (
                        <span className="flex-shrink-0 text-xs text-zinc-400">×{item.quantity}</span>
                      )}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                        aria-label={`Quitar ${item.product.name}`}
                        title="Quitar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lo que se puede agregar */}
      {missing.length > 0 && (
        <section className="mt-7" aria-labelledby="falta">
          <h3
            id="falta"
            className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400"
          >
            <span>Podés agregar</span>
            <span className="text-zinc-500">{missing.length}</span>
          </h3>
          <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800">
            {missing.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => onSelect(cat.id)}
                  className="w-full px-4 py-3 text-left text-sm text-zinc-300 transition-colors hover:bg-zinc-800/50 hover:text-white"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
