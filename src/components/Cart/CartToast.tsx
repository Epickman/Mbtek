'use client'

import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { useCart } from '@/store/cartStore'
import { formatPrice } from '@/utils/formatPrice'

const VISIBLE_MS = 4500

/** Aviso que confirma que un producto se agregó al carrito, con acceso directo para verlo. */
export default function CartToast() {
  const { lastAdded, dismissAdded, openCart, isOpen, subtotal, totalItems } = useCart()

  // Se cierra solo; cada producto nuevo (key distinta) reinicia el tiempo
  useEffect(() => {
    if (!lastAdded) return
    const t = setTimeout(dismissAdded, VISIBLE_MS)
    return () => clearTimeout(t)
  }, [lastAdded, dismissAdded])

  // Con el carrito abierto el aviso ya no hace falta
  useEffect(() => {
    if (isOpen) dismissAdded()
  }, [isOpen, dismissAdded])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[55] flex justify-center sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {lastAdded && (
        <div
          key={lastAdded.key}
          className="pointer-events-auto w-full max-w-sm animate-fade-in rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl shadow-black/60"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-green-400">
                <Check size={14} />
                Agregado al carrito
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-tight text-white">
                {lastAdded.quantity > 1 && `${lastAdded.quantity} × `}
                {lastAdded.product.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {totalItems} producto{totalItems !== 1 ? 's' : ''} · Subtotal {formatPrice(subtotal)}
              </p>
            </div>
            <button
              onClick={dismissAdded}
              className="-m-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
              aria-label="Cerrar aviso"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-3">
            <button
              onClick={openCart}
              className="w-full rounded-sm bg-[var(--accent)] py-2.5 text-xs font-bold uppercase tracking-[1px] text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Ver carrito
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
