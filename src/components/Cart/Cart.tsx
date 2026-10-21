'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react'
import { useCart, maxQty } from '@/store/cartStore'
import { CheckoutDetails, OrderSent } from './CheckoutSteps'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'

/** Panel lateral del carrito. Se abre desde el botón del Navbar (openCart). */
export default function Cart() {
  const { state, removeItem, updateQty, clear, totalItems, subtotal, isOpen, closeCart } = useCart()
  const [confirmingClear, setConfirmingClear] = useState(false)
  // Pasos: carrito → datos del cliente → pedido enviado
  const [step, setStep] = useState<'cart' | 'details' | 'sent'>('cart')
  const [sentUrl, setSentUrl] = useState('')

  // Al cerrar o abrir el carrito se descarta la confirmación pendiente y se vuelve al primer paso
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen)
    setConfirmingClear(false)
    if (!isOpen) setStep('cart')
  }

  // Sin productos no hay datos que pedir
  const view = step === 'details' && state.items.length === 0 ? 'cart' : step

  // Escape cierra; el fondo no scrollea mientras el panel está abierto
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, closeCart])

  const someUnpriced = state.items.some((i) => i.product.price == null)

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed right-0 top-0 bottom-0 z-[60] flex w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Carrito de compras"
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div className="flex items-center gap-3">
            {view === 'details' && (
              <button
                onClick={() => setStep('cart')}
                className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
                aria-label="Volver al carrito"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide text-white">
                {view === 'cart' ? 'Tu carrito' : view === 'details' ? 'Tus datos' : 'Pedido'}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {view === 'details'
                  ? 'Paso 2 de 2 · Para preparar tu pedido'
                  : totalItems === 0
                  ? 'Sin productos'
                  : `${totalItems} producto${totalItems !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {view === 'details' && (
          <CheckoutDetails
            onSent={(url) => {
              setSentUrl(url)
              setStep('sent')
            }}
          />
        )}
        {view === 'sent' && <OrderSent waUrl={sentUrl} onBack={() => setStep('cart')} />}

        {view === 'cart' && (<>
        {/* Items */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {state.items.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart size={40} className="mx-auto mb-4 text-zinc-700" />
              <p className="text-zinc-400">Tu carrito está vacío.</p>
              <p className="mt-1 text-sm text-zinc-600">Agregá productos desde la tienda.</p>
              <Link
                href="/tienda"
                className="mt-6 inline-block rounded-sm bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[var(--accent-hover)]"
                onClick={closeCart}
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <>
            {state.items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3"
              >
                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/productos/${item.product.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold leading-tight text-white transition-colors hover:text-[var(--accent)]"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="-mr-2 -mt-2 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                      aria-label={`Quitar ${item.product.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="mt-0.5 font-mono text-[0.6875rem] text-zinc-500">{item.product.sku}</p>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    {/* Qty stepper */}
                    <div className="flex items-center rounded-full border border-zinc-700">
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
                        aria-label={`Reducir cantidad de ${item.product.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm text-white" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= maxQty(item.product)}
                        className="flex h-10 w-10 items-center justify-center text-zinc-400 transition-colors hover:text-white disabled:opacity-30"
                        aria-label={`Aumentar cantidad de ${item.product.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {item.product.price != null
                          ? formatPrice(item.product.price * item.quantity)
                          : formatPrice(null)}
                      </p>
                      {item.product.price != null && item.quantity > 1 && (
                        <p className="text-[0.6875rem] text-zinc-500">{formatPrice(item.product.price)} c/u</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="space-y-3 border-t border-zinc-800 p-4">
            <div className="flex items-baseline justify-between px-1">
              <span className="text-sm uppercase tracking-wide text-zinc-400">Subtotal</span>
              <span className="text-xl font-black text-white">{formatPrice(subtotal)}</span>
            </div>
            {someUnpriced && (
              <p className="px-1 text-xs text-zinc-500">
                Algunos productos son a consultar y no están incluidos en el subtotal.
              </p>
            )}
            <button
              onClick={() => setStep('details')}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[var(--accent)] py-4 text-sm font-bold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Continuar con el pedido
              <ArrowRight size={18} />
            </button>
            {confirmingClear ? (
              <div
                role="alertdialog"
                aria-labelledby="clear-cart-title"
                className="rounded-sm border border-red-500/40 bg-red-500/10 p-3"
              >
                <p id="clear-cart-title" className="text-sm font-semibold text-white">
                  ¿Vaciar el carrito?
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Se van a quitar {totalItems === 1 ? 'el producto' : `los ${totalItems} productos`}. No se puede deshacer.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setConfirmingClear(false)}
                    autoFocus
                    className="flex-1 rounded-sm border border-zinc-700 py-2 text-xs font-semibold uppercase tracking-[1px] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      clear()
                      setConfirmingClear(false)
                    }}
                    className="flex-1 rounded-sm bg-red-600 py-2 text-xs font-semibold uppercase tracking-[1px] text-white transition-colors hover:bg-red-500"
                  >
                    Sí, vaciar
                  </button>
                </div>
              </div>
            ) : (
            <div className="flex items-center justify-between px-1">
              <button
                onClick={closeCart}
                className="py-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white"
              >
                ← Seguir comprando
              </button>
              <button
                onClick={() => setConfirmingClear(true)}
                className="py-2 text-xs font-medium text-zinc-500 transition-colors hover:text-red-400"
              >
                Vaciar carrito
              </button>
            </div>
            )}
          </div>
        )}
        </>)}
      </aside>
    </>
  )
}
