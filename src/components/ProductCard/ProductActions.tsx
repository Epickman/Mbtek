'use client'

import { Check, MessageCircle, Plus } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { generateWhatsAppUrl } from '@/utils/whatsapp'
import type { Product } from '@/types'
import { cn } from '@/utils/cn'

interface ProductActionsProps {
  product: Product
  /** card: botón principal a todo el ancho; list: botones compactos en línea */
  variant?: 'card' | 'list'
  className?: string
}

/**
 * Acciones de compra de una tarjeta de producto. El camino principal es el carrito;
 * WhatsApp queda como consulta secundaria.
 */
export default function ProductActions({ product, variant = 'card', className }: ProductActionsProps) {
  const { addItem, openCart, state } = useCart()
  const isInCart = state.items.some((i) => i.product.id === product.id)
  const outOfStock = product.stock === 0

  const waUrl = generateWhatsAppUrl({
    product,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/productos/${product.slug}`,
  })

  const base =
    'flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors'

  return (
    <div className={cn('flex gap-2', className)}>
      {outOfStock ? (
        <button
          disabled
          className={cn(base, 'cursor-not-allowed border border-zinc-800 bg-zinc-900 text-zinc-500', variant === 'card' ? 'flex-1' : 'px-4')}
        >
          Sin stock
        </button>
      ) : isInCart ? (
        <button
          onClick={openCart}
          className={cn(
            base,
            'border border-[var(--accent)]/50 bg-[var(--accent)]/15 text-white hover:bg-[var(--accent)]/25',
            variant === 'card' ? 'flex-1' : 'px-4'
          )}
          aria-label={`${product.name} ya está en el carrito. Ver carrito`}
        >
          <Check size={14} />
          En el carrito
        </button>
      ) : (
        <button
          onClick={() => addItem(product)}
          className={cn(
            base,
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]',
            variant === 'card' ? 'flex-1' : 'px-4'
          )}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <Plus size={14} />
          Agregar
        </button>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          base,
          'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white',
          variant === 'card' && !outOfStock ? 'w-11' : 'px-4'
        )}
        aria-label={`Consultar ${product.name} por WhatsApp`}
        title="Consultar por WhatsApp"
      >
        <MessageCircle size={15} />
        {(variant === 'list' || outOfStock) && <span>Consultar</span>}
      </a>
    </div>
  )
}
