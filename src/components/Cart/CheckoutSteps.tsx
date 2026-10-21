'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react'
import siteConfig from '@/config/site'
import { useCart } from '@/store/cartStore'
import { generateWhatsAppUrl } from '@/utils/whatsapp'
import { formatPrice } from '@/utils/formatPrice'
import type { CustomerInfo } from '@/types'
import { cn } from '@/utils/cn'

const CUSTOMER_KEY = 'mbtek-customer'

const emptyCustomer: CustomerInfo = {
  name: '',
  delivery: siteConfig.checkout.deliveryOptions[0],
  payment: siteConfig.checkout.paymentOptions[0],
}

// Los datos del cliente se recuerdan para el próximo pedido
function loadCustomer(): CustomerInfo {
  try {
    const saved = localStorage.getItem(CUSTOMER_KEY)
    if (!saved) return emptyCustomer
    // Versiones anteriores guardaban también localidad, vehículo y comentarios: se descartan
    const { name, delivery, payment } = { ...emptyCustomer, ...(JSON.parse(saved) as Partial<CustomerInfo>) }
    return { name, delivery, payment }
  } catch {
    return emptyCustomer
  }
}

/** Paso 2: datos mínimos para que el pedido llegue completo a WhatsApp. */
export function CheckoutDetails({ onSent }: { onSent: (waUrl: string) => void }) {
  const { state, totalItems, subtotal } = useCart()
  // Sólo se monta con el carrito abierto, así que ya estamos en el cliente
  const [customer, setCustomer] = useState<CustomerInfo>(loadCustomer)

  const set = <K extends keyof CustomerInfo>(key: K, value: CustomerInfo[K]) =>
    setCustomer((c) => ({ ...c, [key]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
    } catch {
      // localStorage no disponible — no pasa nada, sólo no se recuerda
    }
    const waUrl = generateWhatsAppUrl({ items: state.items, customer })
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    onSent(waUrl)
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <Field label="Nombre y apellido" htmlFor="co-name">
          <input
            id="co-name"
            required
            autoComplete="name"
            value={customer.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputClass}
          />
        </Field>

        <ChoiceGroup
          label="Entrega"
          name="delivery"
          options={siteConfig.checkout.deliveryOptions}
          value={customer.delivery}
          onChange={(v) => set('delivery', v)}
        />

        <ChoiceGroup
          label="Forma de pago"
          name="payment"
          options={siteConfig.checkout.paymentOptions}
          value={customer.payment}
          onChange={(v) => set('payment', v)}
        />
      </div>

      <div className="space-y-3 border-t border-zinc-800 p-4">
        <div className="flex items-baseline justify-between px-1">
          <span className="text-sm text-zinc-400">
            {totalItems} producto{totalItems !== 1 ? 's' : ''}
          </span>
          <span className="text-xl font-black text-white">{formatPrice(subtotal)}</span>
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-[var(--accent)] py-4 text-sm font-bold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          <MessageCircle size={18} />
          Enviar pedido por WhatsApp
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  )
}

/** Paso 3: confirmación después de abrir WhatsApp. */
export function OrderSent({ waUrl, onBack }: { waUrl: string; onBack: () => void }) {
  const { clear, closeCart } = useCart()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <CheckCircle2 size={56} className="text-green-400" />
      <h3 className="mt-5 text-xl font-black uppercase tracking-wide text-white">¡Tu pedido está listo!</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        Abrimos WhatsApp con el detalle. Solo falta que toques <strong className="text-white">Enviar</strong>{' '}
        y te respondemos para confirmar stock, pago y envío.
      </p>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 text-sm text-zinc-400 underline underline-offset-2 transition-colors hover:text-white"
      >
        ¿No se abrió? Abrir WhatsApp
      </a>

      <div className="mt-10 w-full space-y-2">
        <button
          onClick={() => {
            clear()
            closeCart()
            onBack()
          }}
          className="w-full rounded-sm bg-[var(--accent)] py-3.5 text-xs font-bold uppercase tracking-[1.5px] text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          Ya lo envié — vaciar carrito
        </button>
        <button
          onClick={onBack}
          className="w-full rounded-sm border border-zinc-700 py-3.5 text-xs font-semibold uppercase tracking-[1.5px] text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Volver al carrito
        </button>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-3 text-sm text-white placeholder-zinc-600 transition-colors focus:border-[var(--accent)] focus:outline-none'

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-300">{label}</span>
        {hint && <span className="text-[0.6875rem] text-zinc-500">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

function ChoiceGroup({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string
  name: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-300">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={cn(
              'cursor-pointer rounded-full border px-4 py-2.5 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--accent)]',
              value === opt
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-white'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
