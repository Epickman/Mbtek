'use client'

import { useEffect, useState } from 'react'
import { Check, Share2 } from 'lucide-react'
import { cn } from '@/utils/cn'

/**
 * En el celular abre el menú de compartir del sistema (WhatsApp, Instagram, etc.).
 * Donde no existe (la mayoría de las computadoras) copia el link al portapapeles.
 */
export default function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  const share = async () => {
    const url = `${window.location.origin}${path}`
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — MBTEK Parts`, url })
      } catch {
        // cerró el menú sin compartir
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      window.prompt('Copiá el link del producto:', url)
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label={copied ? 'Link copiado' : 'Compartir producto'}
      className={cn(
        'flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-colors',
        copied
          ? 'border-green-500/50 text-green-400'
          : 'border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white'
      )}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      <span className="hidden sm:inline">{copied ? '¡Link copiado!' : 'Compartir'}</span>
    </button>
  )
}
