'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Minus, Check, ShoppingCart, Truck } from 'lucide-react'
import { useCart, maxQty } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatPrice'
import type { Product } from '@/types'
import { cn } from '@/utils/cn'

interface Props {
  product: Product
}

export default function ProductDetailClient({ product }: Props) {
  const { addItem, openCart, state } = useCart()
  const [quantity, setQuantity] = useState(1)
  const inCart = state.items.find((i) => i.product.id === product.id)
  const outOfStock = product.stock === 0
  // Lo que todavía se puede sumar sin pasarse del stock
  const available = maxQty(product) - (inCart?.quantity ?? 0)
  const qty = Math.max(1, Math.min(quantity, available))

  // La barra fija de mobile aparece cuando el botón principal sale de la pantalla
  const ctaRef = useRef<HTMLDivElement>(null)
  const [ctaVisible, setCtaVisible] = useState(true)
  useEffect(() => {
    const el = ctaRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const add = () => {
    addItem(product, qty)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      {outOfStock ? (
        <button
          disabled
          className="w-full cursor-not-allowed rounded-full border border-zinc-800 bg-zinc-900 py-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-500"
        >
          Sin stock
        </button>
      ) : (
        <>
          <div ref={ctaRef} className="flex gap-3">
            {/* Cantidad */}
            <div className="flex items-center rounded-full border border-zinc-700" role="group" aria-label="Cantidad">
              <button
                onClick={() => setQuantity(qty - 1)}
                disabled={qty <= 1}
                className="flex h-14 w-12 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
                aria-label="Reducir cantidad"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold text-white" aria-live="polite">
                {qty}
              </span>
              <button
                onClick={() => setQuantity(qty + 1)}
                disabled={qty >= available}
                className="flex h-14 w-12 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
                aria-label="Aumentar cantidad"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={add}
              disabled={available <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              <ShoppingCart size={18} />
              {available <= 0 ? 'Sin más stock' : 'Agregar al carrito'}
            </button>
          </div>

          {inCart && (
            <button
              onClick={openCart}
              className="flex items-center justify-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <Check size={14} className="text-green-400" />
              Tenés {inCart.quantity} en el carrito · <span className="underline underline-offset-2">Ver carrito</span>
            </button>
          )}
        </>
      )}

      <p className="flex items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 text-xs leading-relaxed text-zinc-400">
        <Truck size={16} className="mt-0.5 flex-shrink-0 text-zinc-500" />
        <span>
          Armá tu pedido en el carrito y envialo por WhatsApp: te confirmamos stock, forma de pago y
          costo de envío antes de cobrar nada.
        </span>
      </p>

      {/* Barra fija en mobile */}
      {!outOfStock && (
        <div
          className={cn(
            'fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 lg:hidden',
            ctaVisible ? 'translate-y-full' : 'translate-y-0'
          )}
          aria-hidden={ctaVisible}
          inert={ctaVisible}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-zinc-400">{product.name}</p>
              <p className="font-black text-white">{formatPrice(product.price)}</p>
            </div>
            <button
              onClick={add}
              disabled={available <= 0}
              className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white transition-colors hover:bg-[var(--accent-hover)] disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              <ShoppingCart size={16} />
              {available <= 0 ? 'Sin más stock' : 'Agregar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
